import { useMemo, useRef, useState } from 'react';
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
  const previewRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      await exportPdf(previewRef.current, filename);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Markdown to PDF</h1>
            <p className="text-sm text-slate-500">
              Converta Markdown para PDF — grátis e no seu navegador
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            100% no seu browser — nada é enviado ao servidor
          </span>
        </div>
      </header>

      <Toolbar
        onUpload={handleUpload}
        onClear={handleClear}
        onDownload={handleDownload}
        isExporting={isExporting}
      />

      <div className="flex gap-1 border-b border-slate-200 bg-slate-100 px-4 py-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            mobileTab === 'editor'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600'
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            mobileTab === 'preview'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600'
          }`}
        >
          Preview
        </button>
      </div>

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
        <SplitPane
          mobileTab={mobileTab}
          left={<MarkdownEditor value={markdown} onChange={setMarkdown} />}
          right={<MarkdownPreview ref={previewRef} html={html} />}
        />
      </main>
    </div>
  );
}

export default App;
