import { useTranslation } from 'react-i18next';

export function Header() {
  const { t, i18n } = useTranslation();

  return (
    <header className="site-header">
      <div>
        <h1>{t('header.title')}</h1>
        <p>{t('header.subtitle')}</p>
      </div>
      <label className="language-control">
        <span>{t('header.language')}</span>
        <select
          value={i18n.language.startsWith('ja') ? 'ja' : 'en'}
          onChange={(event) => void i18n.changeLanguage(event.target.value)}
        >
          <option value="ja">日本語</option>
          <option value="en">English</option>
        </select>
      </label>
    </header>
  );
}
