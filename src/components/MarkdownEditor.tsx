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
      className="h-full w-full resize-none border-0 bg-zinc-50/50 p-5 font-mono text-[13px] leading-relaxed text-zinc-800 outline-none focus:bg-white focus:ring-0"
      placeholder="Digite ou cole seu Markdown aqui..."
      aria-label="Editor Markdown"
    />
  );
}
