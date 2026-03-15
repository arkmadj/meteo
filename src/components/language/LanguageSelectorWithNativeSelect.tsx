/**
 * LanguageSelector with NativeSelect
 * Example showing how to use the NativeSelect component in LanguageSelector
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import { NativeSelect } from '@/components/ui/atoms';

const LanguageSelectorWithNativeSelect: React.FC = () => {
  const { i18n, t } = useTranslation();

  const supportedLanguages = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    ja: '日本語',
    ko: '한국어',
    zh: '中文',
  };

  const languageOptions = Object.entries(supportedLanguages).map(([value, label]) => ({
    value,
    label,
  }));

  const currentLanguage = i18n.language || 'en';

  const changeLanguage = (language: string) => {
    void i18n.changeLanguage(language);
  };

  return (
    <div className="w-full max-w-xs">
      <NativeSelect
        data-testid="language-selector"
        helperText={t('navigation.languageHelper', 'Choose your preferred language')}
        label={t('navigation.language')}
        options={languageOptions}
        size="sm"
        value={currentLanguage}
        variant="default"
        onValueChange={changeLanguage}
      />
    </div>
  );
};

export default LanguageSelectorWithNativeSelect;
