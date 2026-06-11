import { forwardRef } from 'react';

type MarkdownPreviewProps = {
  html: string;
};

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  function MarkdownPreview({ html }, ref) {
    return (
      <div
        ref={ref}
        className="markdown-preview h-full overflow-auto bg-white p-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
);
