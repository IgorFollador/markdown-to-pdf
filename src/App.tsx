import { useMemo, useState } from 'react';
import { AppIcon } from './components/AppIcon';
import { DownloadModal } from './components/DownloadModal';
import { MarkdownEditor } from './components/MarkdownEditor';
import { MarkdownPreview } from './components/MarkdownPreview';
import { SplitPane } from './components/SplitPane';
import { Toolbar } from './components/Toolbar';
import { EXAMPLE_MARKDOWN } from './content/exampleMarkdown';
import { exportPdf } from './lib/exportPdf';
import { renderMarkdown } from './lib/markdown';

function App() {
  const [markdown, setMarkdown] = useState(EXAMPLE_MARKDOWN);
  const [filename, setFilename] = useState('document.pdf');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const html = useMemo(() => renderMarkdown(markdown), [markdown]);

  const handleUpload = (content: string, name: string) => {
    setMarkdown(content);
    const baseName = name.replace(/\.(md|markdown|txt)$/i, '') || 'document';
    setFilename(`${baseName}.pdf`);
    setMobileTab('preview');
  };

  const handleClear = () => {
    setMarkdown('');
    setFilename('document.pdf');
  };

  const handleDownloadClick = () => {
    if (!html.trim() || isExporting) return;
    setDownloadModalOpen(true);
  };

  const handleDownloadConfirm = async (chosenFilename: string) => {
    if (!html.trim() || isExporting) return;
    setFilename(chosenFilename);
    setIsExporting(true);
    try {
      await exportPdf(html, chosenFilename);
      setDownloadModalOpen(false);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="border-b border-zinc-200/80 bg-white/90 px-4 py-3.5 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AppIcon className="h-9 w-9 shrink-0 rounded-lg shadow-sm" />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
                Markdown to PDF
              </h1>
              <p className="text-xs text-zinc-500">
                Converta Markdown para PDF no navegador
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            100% local — nada sai do seu browser
          </span>
        </div>
      </header>

      <Toolbar
        onUpload={handleUpload}
        onClear={handleClear}
        onDownload={handleDownloadClick}
        isExporting={isExporting}
        canDownload={html.trim().length > 0}
      />

      <DownloadModal
        open={downloadModalOpen}
        defaultFilename={filename}
        isExporting={isExporting}
        onClose={() => !isExporting && setDownloadModalOpen(false)}
        onConfirm={handleDownloadConfirm}
      />

      <div className="flex gap-1 border-b border-zinc-200 bg-zinc-100/80 px-4 py-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            mobileTab === 'editor'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            mobileTab === 'preview'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Preview
        </button>
      </div>

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col p-3 md:p-4">
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm">
          <SplitPane
            mobileTab={mobileTab}
            left={<MarkdownEditor value={markdown} onChange={setMarkdown} />}
            right={<MarkdownPreview html={html} />}
          />
        </div>
      </main>

      <footer className="border-t border-zinc-200/80 bg-zinc-50/80 px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-zinc-500 sm:flex-row">
          <span>
            Criado por{' '}
            <a
              href="https://github.com/IgorFollador"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 transition hover:text-zinc-900 hover:decoration-zinc-500"
            >
              Igor Follador
            </a>
          </span>
          <a
            href="https://github.com/IgorFollador/markdown-to-pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-700"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            Open Source
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
