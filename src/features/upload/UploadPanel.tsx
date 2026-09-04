import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface UploadPanelProps {
  disabled: boolean;
  onFiles: (files: File[]) => Promise<void>;
  onDropFiles: (dataTransfer: DataTransfer) => Promise<void>;
}

export function UploadPanel({ disabled, onFiles, onDropFiles }: UploadPanelProps) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  const changed = (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    event.target.value = '';
    if (files.length > 0) void onFiles(files);
  };

  const dropped = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) void onDropFiles(event.dataTransfer);
  };

  return (
    <section className="section" aria-labelledby="upload-heading">
      <h2 id="upload-heading">{t('upload.heading')}</h2>
      <div
        className={`drop-zone${dragging ? ' is-dragging' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setDragging(false);
        }}
        onDrop={dropped}
      >
        <strong>{t(dragging ? 'upload.dragActive' : 'upload.drop')}</strong>
        <span>{t('upload.or')}</span>
        <div className="button-row">
          <button
            type="button"
            className="secondary-button"
            disabled={disabled}
            onClick={() => fileInput.current?.click()}
          >
            {t('upload.files')}
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={disabled}
            onClick={() => folderInput.current?.click()}
          >
            {t('upload.folder')}
          </button>
        </div>
        <small>{t('upload.formats')}</small>
        <input
          ref={fileInput}
          className="visually-hidden"
          type="file"
          accept=".zip,.mcpack,.png,image/png,application/zip"
          multiple
          onChange={changed}
        />
        <input
          ref={folderInput}
          className="visually-hidden"
          type="file"
          multiple
          // React does not expose Chromium's directory picker attribute.
          {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
          onChange={changed}
        />
      </div>
      <p className="privacy-note">{t('upload.privacy')}</p>
    </section>
  );
}
