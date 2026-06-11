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
    </div>
  );
}

export default App;
