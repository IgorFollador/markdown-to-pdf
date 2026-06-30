import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { renderMermaidInContainer } from '../lib/mermaid';

type MarkdownPreviewProps = {
  html: string;
};

export type MarkdownPreviewHandle = {
  getRoot: () => HTMLDivElement | null;
  ensureRendered: () => Promise<void>;
};

export const MarkdownPreview = forwardRef<MarkdownPreviewHandle, MarkdownPreviewProps>(
  function MarkdownPreview({ html }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      getRoot: () => containerRef.current,
      ensureRendered: async () => {
        const container = containerRef.current;
        if (!container) return;
        await renderMermaidInContainer(container);
      },
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let cancelled = false;

      void renderMermaidInContainer(container, () => cancelled);

      return () => {
        cancelled = true;
      };
    }, [html]);

    return (
      <div className="h-full overflow-auto bg-zinc-50/30 p-4 md:p-6">
        <div
          ref={containerRef}
          className="markdown-preview mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-200/60 md:p-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }
);
