import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { ConversionProgress } from '../features/converter/ConversionProgress';
import { ConversionControls } from '../features/converter/ConversionControls';
import { OutputEdition } from '../features/converter/OutputEdition';
import { PackInformation } from '../features/converter/PackInformation';
import { ReportPanel } from '../features/report/ReportPanel';
import { UploadPanel } from '../features/upload/UploadPanel';
import { useTextureConverter } from '../hooks/useTextureConverter';

export function App() {
  const { t } = useTranslation();
  const converter = useTextureConverter();
  const busy = ['reading', 'analyzing', 'converting'].includes(converter.status);

  return (
    <div className="app-shell">
      <Header />
      <main>
        <UploadPanel
          disabled={busy}
          onFiles={converter.loadFiles}
          onDropFiles={converter.loadDrop}
        />
        {converter.rawInput && (
          <PackInformation
            name={converter.rawInput.name}
            edition={converter.rawInput.detectedEdition}
            summary={converter.summary}
            disabled={busy}
            onChooseEdition={converter.chooseEdition}
          />
        )}
        <OutputEdition
          value={converter.targetEdition}
          ps3Version={converter.ps3Version}
          disabled={busy}
          onChange={converter.chooseTargetEdition}
        />
        <ConversionControls
          disabled={!converter.pack || !converter.baseline || busy}
          converting={converter.status === 'converting'}
          hasResult={Boolean(converter.result)}
          suggestedItemResolution={converter.summary?.suggestedItemResolution ?? 16}
          itemMapping={converter.itemMapping}
          onConvert={converter.convert}
        />
        {converter.progress && busy && <ConversionProgress progress={converter.progress} />}
        {converter.error && (
          <section className="error-message" role="alert">
            <strong>{t('errors.heading')}</strong>
            <span>{t(`errors.${converter.error}`, { defaultValue: t('errors.generic') })}</span>
          </section>
        )}
        {converter.result && converter.downloadUrl && (
          <ReportPanel
            report={converter.result.report}
            downloadUrl={converter.downloadUrl}
            downloadName={converter.result.downloadName}
          />
        )}
      </main>
      <footer>
        <span>{t('footer.note')}</span>
        <strong>{t('footer.disclaimer')}</strong>
      </footer>
    </div>
  );
}
