import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { makeClientId, type AccessGroupDraft } from '@/types/visualConfig';
import { ExpandableInput } from './ExpandableInput';
import { StringListEditor } from './StringListEditor';
import styles from './Blocks.module.scss';

const createAccessGroup = (): AccessGroupDraft => ({
  id: makeClientId(),
  name: '',
  apiKeys: [''],
  providers: [''],
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
  const updateGroup = (id: string, patch: Partial<AccessGroupDraft>) => {
    onChange(value.map((group) => (group.id === id ? { ...group, ...patch } : group)));
  };

  return (
    <div className={styles.storeAuthEditor}>
      {value.length === 0 ? (
        <p className={styles.storeAuthEmpty}>{t('config_management.visual.access_groups.empty')}</p>
      ) : null}
      {value.map((group) => (
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
          <div className={styles.storeAuthField}>
            <span>{t('config_management.visual.access_groups.providers')}</span>
            <StringListEditor
              value={group.providers}
              disabled={disabled}
              placeholder="alysis"
              onChange={(providers) => updateGroup(group.id, { providers })}
            />
          </div>
        </div>
      ))}
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
