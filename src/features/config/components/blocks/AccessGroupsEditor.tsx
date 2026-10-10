import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { pluginsApi } from '@/services/api';
import { makeClientId, type AccessGroupDraft } from '@/types/visualConfig';
import { ExpandableInput } from './ExpandableInput';
import { StringListEditor } from './StringListEditor';
import styles from './Blocks.module.scss';

const BUILTIN_PROVIDERS: Array<{ id: string; label: string }> = [
  { id: 'claude', label: 'Claude' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'gemini-cli', label: 'Gemini CLI' },
  { id: 'aistudio', label: 'AI Studio' },
  { id: 'antigravity', label: 'Antigravity' },
  { id: 'codex', label: 'Codex' },
  { id: 'vertex', label: 'Vertex' },
  { id: 'interactions', label: 'Interactions' },
  { id: 'xai', label: 'xAI' },
  { id: 'kimi', label: 'Kimi' },
  { id: 'kimi-ai', label: 'Kimi AI' },
  { id: 'meta', label: 'Meta' },
  { id: 'devin', label: 'Devin' },
];

const createAccessGroup = (): AccessGroupDraft => ({
  id: makeClientId(),
  name: '',
  apiKeys: [''],
  providers: [],
});

export const AccessGroupsEditor = memo(function AccessGroupsEditor({
  value,
  disabled,
  onChange,
}: {
  value: AccessGroupDraft[];
  disabled?: boolean;
  onChange: (next: AccessGroupDraft[]) => void;
}) {
  const { t } = useTranslation();
  const [pluginIds, setPluginIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    pluginsApi
      .list()
      .then((response) => {
        if (cancelled) return;
        setPluginIds(
          [...new Set(response.plugins.map((plugin) => plugin.id.trim()).filter(Boolean))].sort()
        );
      })
      .catch(() => {
        if (!cancelled) setPluginIds([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const catalog = useMemo(() => {
    const seen = new Set<string>();
    const items: Array<{ id: string; label: string }> = [];
    const add = (id: string, label: string) => {
      const key = id.trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      items.push({ id: key, label });
    };
    for (const provider of BUILTIN_PROVIDERS) add(provider.id, provider.label);
    for (const id of pluginIds) add(id, id);
    for (const group of value) {
      for (const id of group.providers) add(id, id);
    }
    return items;
  }, [pluginIds, value]);

  const updateGroup = (id: string, patch: Partial<AccessGroupDraft>) => {
    onChange(value.map((group) => (group.id === id ? { ...group, ...patch } : group)));
  };

  const toggleProvider = (group: AccessGroupDraft, providerId: string) => {
    const selected = new Set(group.providers.map((item) => item.trim()).filter(Boolean));
    if (selected.has(providerId)) selected.delete(providerId);
    else selected.add(providerId);
    const providers = catalog.map((item) => item.id).filter((id) => selected.has(id));
    for (const id of selected) {
      if (!providers.includes(id)) providers.push(id);
    }
    updateGroup(group.id, {
      providers,
      name: group.name.trim() || (selected.has(providerId) ? providerId : group.name),
    });
  };

  return (
    <div className={styles.storeAuthEditor}>
      {value.length === 0 ? (
        <p className={styles.storeAuthEmpty}>{t('config_management.visual.access_groups.empty')}</p>
      ) : null}
      {value.map((group) => {
        const selected = new Set(group.providers.map((item) => item.trim()).filter(Boolean));
        return (
          <div key={group.id} className={styles.storeAuthRule}>
            <div className={styles.storeAuthRuleHeader}>
              <strong>
                {group.name.trim() || t('config_management.visual.access_groups.unnamed')}
              </strong>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(value.filter((item) => item.id !== group.id))}
                disabled={disabled}
              >
                {t('config_management.visual.common.delete')}
              </Button>
            </div>
            <label className={styles.storeAuthField}>
              <span>{t('config_management.visual.access_groups.name')}</span>
              <ExpandableInput
                value={group.name}
                placeholder="alysis"
                disabled={disabled}
                onChange={(name) => updateGroup(group.id, { name })}
              />
            </label>
            <div className={styles.storeAuthField}>
              <span>{t('config_management.visual.access_groups.keys')}</span>
              <StringListEditor
                value={group.apiKeys}
                disabled={disabled}
                placeholder="sk-..."
                onChange={(apiKeys) => updateGroup(group.id, { apiKeys })}
              />
            </div>
            <div className={styles.storeAuthApplyTo}>
              <span>{t('config_management.visual.access_groups.providers')}</span>
              <div className={styles.storeAuthCheckboxes}>
                {catalog.map((provider) => (
                  <label key={provider.id} className={styles.storeAuthCheckbox}>
                    <input
                      type="checkbox"
                      checked={selected.has(provider.id)}
                      disabled={disabled}
                      onChange={() => toggleProvider(group, provider.id)}
                    />
                    <span>{provider.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      <div className={styles.actionRow}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange([...value, createAccessGroup()])}
          disabled={disabled}
        >
          {t('config_management.visual.access_groups.add')}
        </Button>
      </div>
    </div>
  );
});
