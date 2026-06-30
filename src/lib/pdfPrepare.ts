import { transformCodeBlocks } from './hljsPdf';
import {
  createMermaidErrorHtml,
  renderMermaidToSvg,
} from './mermaid';

const MERMAID_WRAPPER_STYLE =
  'background:#18181b;padding:16px;margin:14px 0;text-align:center;';

function clonePreviewHtml(previewRoot: HTMLElement): string {
  const clone = previewRoot.cloneNode(true) as HTMLElement;
  return clone.innerHTML;
}

function wrapMermaidSvg(container: HTMLElement): void {
  container
    .querySelectorAll('.mermaid-rendered, .mermaid')
    .forEach((node) => {
      const el = node as HTMLElement;
      const svg = el.querySelector('svg');
      if (!svg) return;

      const wrapper = document.createElement('div');
      wrapper.setAttribute('style', MERMAID_WRAPPER_STYLE);
      wrapper.appendChild(svg.cloneNode(true));
      el.replaceWith(wrapper);
    });
}

async function renderPendingMermaid(container: HTMLElement): Promise<void> {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>('.mermaid')
  ).filter((node) => !node.querySelector('svg'));

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    const code =
      node.getAttribute('data-source') ?? node.textContent?.trim() ?? '';
    const wrapper = document.createElement('div');
    wrapper.setAttribute('style', MERMAID_WRAPPER_STYLE);

    try {
      const svgMarkup = await renderMermaidToSvg(code, `mermaid-pdf-${i}`);
      wrapper.innerHTML = svgMarkup;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao renderizar diagrama';
      wrapper.innerHTML = createMermaidErrorHtml(message);
    }

    node.replaceWith(wrapper);
  }
}

function transformBlockquotes(container: HTMLElement): void {
  container.querySelectorAll('blockquote').forEach((blockquote) => {
    const paragraph = blockquote.querySelector(':scope > p');
    const content = paragraph
      ? paragraph.innerHTML
      : blockquote.innerHTML;

    const table = document.createElement('table');
    table.setAttribute('style', 'width:100%;border-collapse:collapse;margin:10px 0;');
    const row = document.createElement('tr');

    const bar = document.createElement('td');
    bar.setAttribute('style', 'width:3px;background:#d4d4d8;padding:0;');

    const text = document.createElement('td');
    text.setAttribute(
      'style',
      'padding:2px 0 2px 14px;color:#52525b;font-style:italic;line-height:1.6;'
    );
    text.innerHTML = content;

    row.appendChild(bar);
    row.appendChild(text);
    table.appendChild(row);
    blockquote.replaceWith(table);
  });
}

function transformHeadings(container: HTMLElement): void {
  const styles: Record<string, string> = {
    H1: 'font-size:24px;font-weight:bold;margin:0 0 10px;color:#18181b;',
    H2: 'font-size:18px;font-weight:bold;margin:18px 0 8px;color:#18181b;',
    H3: 'font-size:16px;font-weight:bold;margin:14px 0 6px;color:#18181b;',
    H4: 'font-size:14px;font-weight:bold;margin:12px 0 4px;color:#18181b;',
    H5: 'font-size:13px;font-weight:bold;margin:10px 0 4px;color:#18181b;',
    H6: 'font-size:12px;font-weight:bold;margin:10px 0 4px;color:#18181b;',
  };

  Object.entries(styles).forEach(([tag, style]) => {
    container.querySelectorAll(tag.toLowerCase()).forEach((heading) => {
      heading.setAttribute('style', style);
    });
  });
}

function applyBodyStyles(container: HTMLElement): void {
  container.querySelectorAll('p').forEach((p) => {
    p.setAttribute('style', 'margin:0 0 10px;line-height:1.65;color:#18181b;');
  });

  container.querySelectorAll('a').forEach((a) => {
    a.setAttribute('style', 'color:#2563eb;text-decoration:underline;');
  });

  container.querySelectorAll('hr').forEach((hr) => {
    hr.setAttribute('style', 'margin:20px 0;border:none;border-top:1px solid #e4e4e7;');
  });

  container.querySelectorAll('ul, ol').forEach((list) => {
    list.setAttribute('style', 'margin:0 0 10px 18px;line-height:1.65;color:#18181b;');
  });

  container.querySelectorAll('li').forEach((li) => {
    li.setAttribute('style', 'margin:0 0 4px;line-height:1.65;');
  });
}

function applyTableStyles(container: HTMLElement): void {
  container.querySelectorAll('table').forEach((table) => {
    if (!table.querySelector('th')) return;

    table.setAttribute(
      'style',
      'width:100%;border-collapse:collapse;margin:12px 0;'
    );
    table.querySelectorAll('th').forEach((th) => {
      th.setAttribute(
        'style',
        'border-bottom:1px solid #e4e4e7;padding:8px 12px;background:#fafafa;font-weight:bold;text-align:left;color:#18181b;'
      );
    });
    table.querySelectorAll('td').forEach((td) => {
      td.setAttribute(
        'style',
        'border-bottom:1px solid #e4e4e7;padding:8px 12px;text-align:left;color:#18181b;'
      );
    });
  });
}

function transformCheckboxes(container: HTMLElement): void {
  container.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    const checked = input.hasAttribute('checked');
    input.replaceWith(document.createTextNode(checked ? '☑ ' : '☐ '));
  });
}

export async function prepareHtmlForPdf(
  html: string,
  previewRoot?: HTMLElement | null
): Promise<string> {
  const container = document.createElement('div');
  container.innerHTML = previewRoot
    ? clonePreviewHtml(previewRoot)
    : html;

  wrapMermaidSvg(container);
  await renderPendingMermaid(container);
  transformBlockquotes(container);
  transformCheckboxes(container);
  transformHeadings(container);
  applyBodyStyles(container);
  applyTableStyles(container);
  transformCodeBlocks(container);

  return container.innerHTML;
}
