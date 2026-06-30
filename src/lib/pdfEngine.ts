import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import vfs from 'pdfmake/build/vfs_fonts';
import { HLJS_PDF_PRE_FILL, HLJS_PDF_PRE_TEXT } from './hljsPdf';
import { prepareHtmlForPdf } from './pdfPrepare';

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

const TABLE_LAYOUT = {
  hLineWidth: (i: number, node: { table: { body: unknown[] } }) =>
    i === 0 || i === node.table.body.length ? 0 : 0.5,
  vLineWidth: () => 0,
  hLineColor: () => '#e4e4e7',
  vLineColor: () => '#e4e4e7',
  paddingLeft: () => 10,
  paddingRight: () => 10,
  paddingTop: () => 6,
  paddingBottom: () => 6,
};

const PDF_DEFAULT_STYLES = {
  b: { bold: true },
  strong: { bold: true },
  em: { italics: true },
  i: { italics: true },
  s: { decoration: 'lineThrough' as const },
  u: { decoration: 'underline' as const },
  a: { color: '#2563eb', decoration: 'underline' as const },
  h1: {
    fontSize: 24,
    bold: true,
    margin: [0, 0, 0, 10],
    marginBottom: '',
    color: '#18181b',
  },
  h2: {
    fontSize: 18,
    bold: true,
    margin: [0, 18, 0, 8],
    marginBottom: '',
    color: '#18181b',
  },
  h3: {
    fontSize: 16,
    bold: true,
    margin: [0, 14, 0, 6],
    marginBottom: '',
    color: '#18181b',
  },
  h4: {
    fontSize: 14,
    bold: true,
    margin: [0, 12, 0, 4],
    marginBottom: '',
    color: '#18181b',
  },
  h5: {
    fontSize: 13,
    bold: true,
    margin: [0, 10, 0, 4],
    marginBottom: '',
    color: '#18181b',
  },
  h6: {
    fontSize: 12,
    bold: true,
    margin: [0, 10, 0, 4],
    marginBottom: '',
    color: '#18181b',
  },
  p: { margin: [0, 0, 0, 10], marginBottom: '', lineHeight: 1.65 },
  ul: { margin: [0, 0, 0, 10], marginBottom: '', marginLeft: 14 },
  ol: { margin: [0, 0, 0, 10], marginBottom: '', marginLeft: 14 },
  li: { margin: [0, 0, 0, 4], marginBottom: '', lineHeight: 1.65 },
  blockquote: {
    italics: true,
    color: '#52525b',
    margin: [0, 4, 0, 10],
    marginBottom: '',
  },
  pre: {
    font: 'Roboto',
    fontSize: 9,
    margin: [0, 4, 0, 10],
    marginBottom: '',
    fillColor: HLJS_PDF_PRE_FILL,
    color: HLJS_PDF_PRE_TEXT,
    lineHeight: 1.5,
  },
  code: {
    font: 'Roboto',
    fontSize: 10,
    fillColor: '#f4f4f5',
    color: '#18181b',
  },
  hr: { margin: [0, 16, 0, 16], marginBottom: '' },
  table: { margin: [0, 6, 0, 10], marginBottom: '' },
  th: { bold: true, fillColor: '#fafafa', color: '#18181b' },
  td: { fillColor: '#ffffff', color: '#18181b' },
};

type PdfNode = {
  nodeName?: string;
  text?: PdfNode | PdfNode[] | string;
  ul?: PdfNode[];
  ol?: PdfNode[];
  stack?: PdfNode[];
  table?: { body?: unknown[][] };
  layout?: unknown;
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

function applyTableLayouts(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(applyTableLayouts);
  }
  if (node && typeof node === 'object') {
    const pdfNode = node as PdfNode;
    if (pdfNode.table) {
      pdfNode.layout = TABLE_LAYOUT;
    }
    if (pdfNode.stack) {
      pdfNode.stack = pdfNode.stack.map((child) => applyTableLayouts(child) as PdfNode);
    }
    if (pdfNode.ul) {
      pdfNode.ul = pdfNode.ul.map((child) => applyTableLayouts(child) as PdfNode);
    }
    if (pdfNode.ol) {
      pdfNode.ol = pdfNode.ol.map((child) => applyTableLayouts(child) as PdfNode);
    }
    if (Array.isArray(pdfNode.text)) {
      pdfNode.text = pdfNode.text.map((child) =>
        typeof child === 'object' ? (applyTableLayouts(child) as PdfNode) : child
      );
    } else if (pdfNode.text && typeof pdfNode.text === 'object') {
      pdfNode.text = applyTableLayouts(pdfNode.text) as PdfNode;
    }
  }
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
  filename: string,
  previewRoot?: HTMLElement | null
): Promise<void> {
  const preparedHtml = await prepareHtmlForPdf(html, previewRoot);
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

  const content = applyTableLayouts(compactPdfContent(rawContent));

  const docDefinition = {
    content,
    images,
    pageSize: 'A4' as const,
    pageMargins: [52, 56, 52, 56] as [number, number, number, number],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 14,
      lineHeight: 1.65,
      color: '#18181b',
    },
  };

  const pdf = pdfMake.createPdf(docDefinition);
  const blob = await pdf.getBlob();
  downloadBlob(blob, filename);
}
