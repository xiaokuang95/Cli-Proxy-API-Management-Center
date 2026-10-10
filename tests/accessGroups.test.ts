import { describe, expect, test } from 'bun:test';
import { parse as parseYaml } from 'yaml';
import { runVisualConfig } from './helpers/visualConfig';

describe('access.groups visual config', () => {
  test('reads named groups from access.groups', () => {
    const yaml = `access:
  api-keys: [open-key]
  groups:
    alysis:
      api-keys: [sk-alysis]
      providers: [alysis]
`;
    const visual = runVisualConfig(yaml);
    expect(visual.visualValues.apiKeysText).toBe('open-key');
    expect(visual.visualValues.accessGroups).toEqual([
      { id: 'access-group-0', name: 'alysis', apiKeys: ['sk-alysis'], providers: ['alysis'] },
    ]);
  });

  test('writes groups without replacing unrestricted keys or upstream api-keys', () => {
    const before = `access:
  api-keys: [open-key]
api-keys:
  claude: []
`;
    const visual = runVisualConfig(before, [
      {
        accessGroups: [
          {
            id: 'g1',
            name: 'alysis',
            apiKeys: ['sk-alysis'],
            providers: ['alysis'],
          },
        ],
      },
    ]);
    const output = parseYaml(visual.applyVisualChangesToYaml(before)) as Record<string, unknown>;
    expect(output.access).toEqual({
      'api-keys': ['open-key'],
      groups: {
        alysis: { 'api-keys': ['sk-alysis'], providers: ['alysis'] },
      },
    });
    expect(output['api-keys']).toEqual({ claude: [] });
  });

  test('clearing groups deletes access.groups only', () => {
    const before = `access:
  api-keys: [open-key]
  groups:
    alysis:
      api-keys: [sk-alysis]
      providers: [alysis]
`;
    const visual = runVisualConfig(before, [{ accessGroups: [] }]);
    const output = parseYaml(visual.applyVisualChangesToYaml(before)) as Record<string, unknown>;
    expect(output.access).toEqual({ 'api-keys': ['open-key'] });
  });
});
