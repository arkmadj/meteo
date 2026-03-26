/**
 * KeyboardShortcutsEditor Component
 * Allows users to view and customize keyboard shortcuts
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useKeyboardShortcutsContext } from '@/contexts/KeyboardShortcutsContext';
import type {
  KeyboardShortcut,
  KeyboardShortcutAction,
  KeyCombination,
  ModifierKey,
} from '@/types/keyboardShortcuts';
import { formatKeyCombination } from '@/types/keyboardShortcuts';

import { Button, Switch } from '@/components/ui/atoms';

interface KeyboardShortcutRowProps {
  shortcut: KeyboardShortcut;
  onEdit: (action: KeyboardShortcutAction) => void;
  onToggle: (action: KeyboardShortcutAction, enabled: boolean) => void;
  isEditing: boolean;
  onSaveEdit: (combo: KeyCombination) => void;
  onCancelEdit: () => void;
  conflictWith: KeyboardShortcutAction | null;
}

const KeyboardShortcutRow: React.FC<KeyboardShortcutRowProps> = ({
  shortcut,
  onEdit,
  onToggle,
  isEditing,
  onSaveEdit,
  onCancelEdit,
  conflictWith,
}) => {
  const [recordedKeys, setRecordedKeys] = useState<KeyCombination | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Ignore modifier-only presses
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      return;
    }

    const modifiers: ModifierKey[] = [];
    if (e.ctrlKey || e.metaKey) modifiers.push('ctrl');
    if (e.altKey) modifiers.push('alt');
    if (e.shiftKey) modifiers.push('shift');

    const combo: KeyCombination = {
      key: e.key.toLowerCase(),
      modifiers,
    };

    setRecordedKeys(combo);
  }, []);

  const handleSave = () => {
    if (recordedKeys) {
      onSaveEdit(recordedKeys);
      setRecordedKeys(null);
    }
  };

  const handleCancel = () => {
    setRecordedKeys(null);
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <div
        className="p-4 rounded-lg border-2 transition-colors"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-accent)',
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-medium" style={{ color: 'var(--theme-text)' }}>
              {shortcut.label}
            </span>
            <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
              Press your new shortcut
            </span>
          </div>
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={recordedKeys ? formatKeyCombination(recordedKeys, isMac) : 'Press keys...'}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 rounded-md text-center font-mono text-lg border"
            style={{
              backgroundColor: 'var(--theme-background)',
              color: 'var(--theme-text)',
              borderColor: conflictWith ? '#ef4444' : 'var(--theme-border)',
            }}
          />
          {conflictWith && <p className="text-xs text-red-500">Conflicts with: {conflictWith}</p>}
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSave}
              disabled={!recordedKeys || !!conflictWith}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-opacity-50"
      style={{ backgroundColor: 'var(--theme-surface)' }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span
            className="font-medium text-sm"
            style={{
              color: shortcut.enabled ? 'var(--theme-text)' : 'var(--theme-text-secondary)',
            }}
          >
            {shortcut.label}
          </span>
          <kbd
            className="px-2 py-1 rounded text-xs font-mono"
            style={{
              backgroundColor: 'var(--theme-background)',
              color: 'var(--theme-text-secondary)',
              border: '1px solid var(--theme-border)',
            }}
          >
            {formatKeyCombination(shortcut.keyCombination, isMac)}
          </kbd>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
          {shortcut.description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => onEdit(shortcut.action)}>
          Edit
        </Button>
        <Switch
          checked={shortcut.enabled}
          onCheckedChange={checked => onToggle(shortcut.action, checked)}
          size="sm"
        />
      </div>
    </div>
  );
};

/**
 * Category labels for grouping shortcuts
 */
const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  navigation: { label: 'Navigation', icon: '🧭' },
  data: { label: 'Data', icon: '📊' },
  display: { label: 'Display', icon: '🖥️' },
  accessibility: { label: 'Accessibility', icon: '♿' },
};

interface KeyboardShortcutsEditorProps {
  className?: string;
}

/**
 * Main keyboard shortcuts editor component
 */
export const KeyboardShortcutsEditor: React.FC<KeyboardShortcutsEditorProps> = ({
  className = '',
}) => {
  const { t } = useTranslation('common');
  const {
    isEnabled,
    setEnabled,
    getShortcutsByCategory,
    toggleShortcut,
    updateShortcut,
    resetToDefaults,
    hasConflict,
  } = useKeyboardShortcutsContext();

  const [editingAction, setEditingAction] = useState<KeyboardShortcutAction | null>(null);
  const [pendingCombo, setPendingCombo] = useState<KeyCombination | null>(null);

  const shortcutsByCategory = getShortcutsByCategory();

  const handleEdit = useCallback((action: KeyboardShortcutAction) => {
    setEditingAction(action);
    setPendingCombo(null);
  }, []);

  const handleSaveEdit = useCallback(
    (combo: KeyCombination) => {
      if (editingAction) {
        updateShortcut(editingAction, combo);
        setEditingAction(null);
        setPendingCombo(null);
      }
    },
    [editingAction, updateShortcut]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingAction(null);
    setPendingCombo(null);
  }, []);

  const currentConflict =
    editingAction && pendingCombo ? hasConflict(editingAction, pendingCombo) : null;

  return (
    <div className={className}>
      {/* Global Enable/Disable */}
      <div className="mb-6">
        <Switch
          label={t('settings.keyboardShortcuts.enableAll', 'Enable keyboard shortcuts')}
          description={t(
            'settings.keyboardShortcuts.enableAllDescription',
            'Toggle all keyboard shortcuts on or off'
          )}
          checked={isEnabled}
          onCheckedChange={setEnabled}
          size="md"
          variant="default"
        />
      </div>

      {/* Shortcuts by Category */}
      <div className="space-y-6">
        {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => {
          const categoryInfo = CATEGORY_LABELS[category] || { label: category, icon: '⌨️' };
          return (
            <div key={category}>
              <h3
                className="text-sm font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'var(--theme-text)' }}
              >
                <span>{categoryInfo.icon}</span>
                <span>{categoryInfo.label}</span>
              </h3>
              <div className="space-y-2">
                {shortcuts.map(shortcut => (
                  <KeyboardShortcutRow
                    key={shortcut.action}
                    shortcut={shortcut}
                    onEdit={handleEdit}
                    onToggle={toggleShortcut}
                    isEditing={editingAction === shortcut.action}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    conflictWith={editingAction === shortcut.action ? currentConflict : null}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset Button */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
        <Button variant="secondary" size="sm" onClick={resetToDefaults}>
          {t('settings.keyboardShortcuts.resetToDefaults', 'Reset to Defaults')}
        </Button>
      </div>
    </div>
  );
};

export default KeyboardShortcutsEditor;
