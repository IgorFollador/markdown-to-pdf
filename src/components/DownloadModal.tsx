import { useEffect, useId, useRef, useState } from 'react';

type DownloadModalProps = {
  open: boolean;
  defaultFilename: string;
  isExporting: boolean;
  onClose: () => void;
  onConfirm: (filename: string) => void;
};

function stripExtension(name: string): string {
  return name.replace(/\.pdf$/i, '').trim();
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function toPdfFilename(name: string): string {
  const base = sanitizeFilename(stripExtension(name)) || 'document';
  return `${base}.pdf`;
}

export function DownloadModal({
  open,
  defaultFilename,
  isExporting,
  onClose,
  onConfirm,
}: DownloadModalProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(stripExtension(defaultFilename));

  useEffect(() => {
    if (open) {
      setName(stripExtension(defaultFilename));
    }
  }, [open, defaultFilename]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isExporting) onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const timer = window.setTimeout(() => inputRef.current?.select(), 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [open, isExporting, onClose]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isExporting) return;
    onConfirm(toPdfFilename(name));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={isExporting ? undefined : onClose}
    >
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-zinc-900">
          Salvar PDF
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Escolha o nome do arquivo antes de baixar.
        </p>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="pdf-filename" className="text-sm font-medium text-zinc-700">
            Nome do arquivo
          </label>
          <div className="mt-1.5 flex overflow-hidden rounded-lg border border-zinc-300 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
            <input
              ref={inputRef}
              id="pdf-filename"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isExporting}
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 border-0 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none disabled:bg-zinc-50"
              placeholder="documento"
            />
            <span className="flex items-center border-l border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-500">
              .pdf
            </span>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isExporting || !sanitizeFilename(name)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Gerando...
                </>
              ) : (
                'Baixar PDF'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
