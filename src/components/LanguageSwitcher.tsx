import type { ChangeEvent } from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE, languageNames, SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n/resources';

type LanguageSwitcherProps = {
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ compact = false, className = '' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const currentLanguage = (SUPPORTED_LANGUAGES.includes(i18n.language as SupportedLanguage)
    ? (i18n.language as SupportedLanguage)
    : DEFAULT_LANGUAGE);

  const onLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as SupportedLanguage;
    void switchLanguage(next);
  };

  const switchLanguage = async (next: SupportedLanguage) => {
    if (next === currentLanguage) return;

    const html = document.documentElement;
    html.classList.add('lang-switching');

    try {
      await i18n.changeLanguage(next);
      localStorage.setItem('f2m_language', next);
    } finally {
      window.setTimeout(() => {
        html.classList.remove('lang-switching');
      }, 220);
    }
  };

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm text-stone-700 shadow-sm ${className}`.trim()}
      data-no-translate="true"
      aria-label={t('language')}
    >
      <Languages className="h-4 w-4 text-green-600" />
      {!compact && <span className="text-xs font-medium text-stone-600">{t('language')}</span>}
      <select
        value={currentLanguage}
        onChange={onLanguageChange}
        className="bg-transparent text-sm font-medium text-stone-700 outline-none"
        aria-label={t('language')}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {languageNames[lang]}
          </option>
        ))}
      </select>
    </label>
  );
}
