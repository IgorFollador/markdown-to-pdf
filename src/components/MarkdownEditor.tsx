type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      className="h-full w-full resize-none border-0 bg-white p-4 font-mono text-sm leading-relaxed text-slate-800 outline-none focus:ring-0"
      placeholder="Digite ou cole seu Markdown aqui..."
      aria-label="Editor Markdown"
    />
  );
}
