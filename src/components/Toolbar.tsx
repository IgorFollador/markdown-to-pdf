import { useRef } from 'react';

type ToolbarProps = {
  onUpload: (content: string, filename: string) => void;
  onClear: () => void;
  onDownload: () => void;
  isExporting: boolean;
};

export function Toolbar({
  onUpload,
  onClear,
  onDownload,
  isExporting,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpload(String(reader.result ?? ''), file.name);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Upload .md
      </button>
      <button
        type="button"
        onClick={onClear}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Limpar
      </button>
      <button
        type="button"
        onClick={onDownload}
        disabled={isExporting}
        className="ml-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isExporting ? 'Gerando PDF...' : 'Download PDF'}
      </button>
    </div>
  );
}
