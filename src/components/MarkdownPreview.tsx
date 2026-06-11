type MarkdownPreviewProps = {
  html: string;
};

export function MarkdownPreview({ html }: MarkdownPreviewProps) {
  return (
    <div className="h-full overflow-auto bg-zinc-50/30 p-4 md:p-6">
      <div
        className="markdown-preview mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-200/60 md:p-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
