import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import vfs from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = vfs;

const BLOCK_NODES = new Set([
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'P',
  'UL',
  'OL',
  'LI',
  'BLOCKQUOTE',
  'PRE',
  'TABLE',
  'HR',
  'DIV',
]);

const PDF_DEFAULT_STYLES = {
  b: { bold: true },
  strong: { bold: true },
  em: { italics: true },
  i: { italics: true },
  s: { decoration: 'lineThrough' as const },
  u: { decoration: 'underline' as const },
  a: { color: '#2563eb', decoration: 'underline' as const },
  h1: {
    fontSize: 20,
    bold: true,
    margin: [0, 0, 0, 6],
    marginBottom: '',
  },
  h2: {
    fontSize: 15,
    bold: true,
    margin: [0, 10, 0, 4],
    marginBottom: '',
  },
  h3: {
    fontSize: 13,
    bold: true,
    margin: [0, 8, 0, 3],
    marginBottom: '',
  },
  h4: {
    fontSize: 12,
    bold: true,
    margin: [0, 6, 0, 3],
    marginBottom: '',
  },
  h5: {
    fontSize: 11,
    bold: true,
    margin: [0, 6, 0, 2],
    marginBottom: '',
  },
  h6: {
    fontSize: 11,
    bold: true,
    margin: [0, 6, 0, 2],
    marginBottom: '',
  },
  p: { margin: [0, 0, 0, 6], marginBottom: '' },
  ul: { margin: [0, 0, 0, 6], marginBottom: '', marginLeft: '' },
  ol: { margin: [0, 0, 0, 6], marginBottom: '', marginLeft: '' },
  li: { margin: [0, 0, 0, 2], marginBottom: '', marginLeft: '' },
  blockquote: {
    italics: true,
    color: '#475569',
    margin: [12, 2, 0, 6],
    marginBottom: '',
  },
  pre: {
    font: 'Roboto',
    fontSize: 9,
    margin: [0, 2, 0, 6],
    marginBottom: '',
    fillColor: '#f1f5f9',
  },
  code: { font: 'Roboto', fontSize: 10, fillColor: '#f1f5f9' },
  hr: { margin: [0, 8, 0, 8], marginBottom: '' },
  table: { margin: [0, 2, 0, 6], marginBottom: '' },
  th: { bold: true, fillColor: '#f1f5f9' },
};

type PdfNode = {
  nodeName?: string;
  text?: PdfNode | PdfNode[] | string;
  ul?: PdfNode[];
  ol?: PdfNode[];
  stack?: PdfNode[];
  margin?: unknown;
  marginBottom?: unknown;
  marginTop?: unknown;
  marginLeft?: unknown;
  marginRight?: unknown;
  [key: string]: unknown;
};

function stripInlineMargins(node: PdfNode): PdfNode {
  const isBlock = node.nodeName ? BLOCK_NODES.has(node.nodeName) : false;

  if (!isBlock) {
    delete node.margin;
    delete node.marginBottom;
    delete node.marginTop;
    delete node.marginLeft;
    delete node.marginRight;
  }

  if (Array.isArray(node.text)) {
    node.text = node.text.map((child) =>
      typeof child === 'object' ? stripInlineMargins(child) : child
    );
  } else if (node.text && typeof node.text === 'object') {
    node.text = stripInlineMargins(node.text);
  }

  if (node.ul) node.ul = node.ul.map(stripInlineMargins);
  if (node.ol) node.ol = node.ol.map(stripInlineMargins);
  if (node.stack) node.stack = node.stack.map(stripInlineMargins);

  return node;
}

function compactPdfContent(content: unknown): unknown {
  if (Array.isArray(content)) {
    return content.map((item) => compactPdfContent(item));
  }
  if (content && typeof content === 'object') {
    return stripInlineMargins(content as PdfNode);
  }
  return content;
}

function prepareHtmlForPdf(html: string): string {
  const container = document.createElement('div');
  container.innerHTML = html;

  container.querySelectorAll('blockquote').forEach((blockquote) => {
    const paragraph = blockquote.querySelector(':scope > p');
    if (paragraph && blockquote.children.length === 1) {
      blockquote.innerHTML = paragraph.innerHTML;
    }
    blockquote.setAttribute(
      'style',
      'margin-left:12px; color:#475569; font-style:italic; border-left:2px solid #cbd5e1; padding-left:10px;'
    );
  });

  container.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    const checked = input.hasAttribute('checked');
    input.replaceWith(document.createTextNode(checked ? '☑ ' : '☐ '));
  });

  return container.innerHTML;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function createPdfDownload(
  html: string,
  filename: string
): Promise<void> {
  const preparedHtml = prepareHtmlForPdf(html);
  const converted = htmlToPdfmake(preparedHtml, {
    window,
    tableAutoSize: true,
    removeExtraBlanks: true,
    removeTagClasses: true,
    defaultStyles: PDF_DEFAULT_STYLES,
  });

  const rawContent =
    converted !== null &&
    typeof converted === 'object' &&
    !Array.isArray(converted) &&
    'content' in converted
      ? (converted as { content: unknown }).content
      : converted;
  const images =
    converted !== null &&
    typeof converted === 'object' &&
    !Array.isArray(converted) &&
    'images' in converted
      ? (converted as { images?: Record<string, string> }).images
      : undefined;

  const content = compactPdfContent(rawContent);

  const docDefinition = {
    content,
    images,
    pageSize: 'A4' as const,
    pageMargins: [48, 52, 48, 52] as [number, number, number, number],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 11,
      lineHeight: 1.35,
      color: '#1e293b',
    },
  };

  const pdf = pdfMake.createPdf(docDefinition);
  const blob = await pdf.getBlob();
  downloadBlob(blob, filename);
}
