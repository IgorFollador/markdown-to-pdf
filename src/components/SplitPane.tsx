import type { ReactNode } from 'react';

type SplitPaneProps = {
  left: ReactNode;
  right: ReactNode;
  mobileTab: 'editor' | 'preview';
};

export function SplitPane({ left, right, mobileTab }: SplitPaneProps) {
  return (
    <>
      <div className="hidden h-full min-h-0 flex-1 md:grid md:grid-cols-2">
        <section className="flex min-h-0 flex-col border-r border-zinc-200/80" aria-label="Editor">
          <header className="border-b border-zinc-200/80 bg-zinc-50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Editor
          </header>
          <div className="min-h-0 flex-1">{left}</div>
        </section>
        <section className="flex min-h-0 flex-col" aria-label="Preview">
          <header className="border-b border-zinc-200/80 bg-zinc-50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Preview
          </header>
          <div className="min-h-0 flex-1">{right}</div>
        </section>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        {mobileTab === 'editor' ? (
          <section className="flex min-h-0 flex-1 flex-col" aria-label="Editor">
            <div className="min-h-0 flex-1">{left}</div>
          </section>
        ) : (
          <section className="flex min-h-0 flex-1 flex-col" aria-label="Preview">
            <div className="min-h-0 flex-1">{right}</div>
          </section>
        )}
      </div>
    </>
  );
}
