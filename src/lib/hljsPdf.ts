const PRE_BACKGROUND = '#0d1117';
const PRE_TEXT_COLOR = '#c9d1d9';

const GITHUB_DARK_COLORS: Record<string, string> = {
  hljs: '#c9d1d9',
  'hljs-doctag': '#ff7b72',
  'hljs-keyword': '#ff7b72',
  'hljs-meta': '#79c0ff',
  'hljs-template-tag': '#ff7b72',
  'hljs-template-variable': '#ff7b72',
  'hljs-type': '#ff7b72',
  'hljs-variable.language_': '#ff7b72',
  'hljs-title': '#d2a8ff',
  'hljs-title.class_': '#d2a8ff',
  'hljs-title.class_.inherited__': '#d2a8ff',
  'hljs-title.function_': '#d2a8ff',
  'hljs-attr': '#79c0ff',
  'hljs-attribute': '#79c0ff',
  'hljs-literal': '#79c0ff',
  'hljs-number': '#79c0ff',
  'hljs-operator': '#79c0ff',
  'hljs-variable': '#79c0ff',
  'hljs-selector-attr': '#79c0ff',
  'hljs-selector-class': '#79c0ff',
  'hljs-selector-id': '#79c0ff',
  'hljs-regexp': '#a5d6ff',
  'hljs-string': '#a5d6ff',
  'hljs-built_in': '#ffa657',
  'hljs-symbol': '#ffa657',
  'hljs-comment': '#8b949e',
  'hljs-code': '#8b949e',
  'hljs-formula': '#8b949e',
  'hljs-name': '#7ee787',
  'hljs-quote': '#7ee787',
  'hljs-selector-tag': '#7ee787',
  'hljs-selector-pseudo': '#7ee787',
  'hljs-subst': '#c9d1d9',
  'hljs-section': '#1f6feb',
  'hljs-bullet': '#f2cc60',
  'hljs-emphasis': '#c9d1d9',
  'hljs-strong': '#c9d1d9',
  'hljs-addition': '#aff5b4',
  'hljs-deletion': '#ffdcd7',
  'hljs-link': '#c9d1d9',
  'hljs-params': '#c9d1d9',
  'hljs-property': '#c9d1d9',
  'hljs-punctuation': '#c9d1d9',
  'hljs-tag': '#c9d1d9',
};

const TOKEN_PRIORITY = [
  'hljs-keyword',
  'hljs-string',
  'hljs-title',
  'hljs-title.function_',
  'hljs-title.class_',
  'hljs-comment',
  'hljs-number',
  'hljs-built_in',
  'hljs-name',
  'hljs-attr',
  'hljs-literal',
  'hljs-type',
  'hljs-variable',
  'hljs-operator',
  'hljs-regexp',
  'hljs-symbol',
  'hljs-meta',
  'hljs-section',
  'hljs-bullet',
  'hljs-subst',
  'hljs-emphasis',
  'hljs-strong',
  'hljs-doctag',
  'hljs-link',
  'hljs-params',
  'hljs-property',
  'hljs-punctuation',
  'hljs-tag',
  'hljs',
];

function resolveSpanColor(span: HTMLElement): string {
  const classes = span.className.split(/\s+/).filter((c) => c.startsWith('hljs'));
  for (const token of TOKEN_PRIORITY) {
    if (classes.includes(token)) {
      return GITHUB_DARK_COLORS[token] ?? PRE_TEXT_COLOR;
    }
  }
  for (const cls of classes) {
    const color = GITHUB_DARK_COLORS[cls];
    if (color) return color;
  }
  return PRE_TEXT_COLOR;
}

function applyHljsColors(root: HTMLElement): void {
  root.querySelectorAll('span[class*="hljs"]').forEach((span) => {
    const el = span as HTMLElement;
    const color = resolveSpanColor(el);
    el.setAttribute('style', `color:${color};`);
  });
}

export function transformCodeBlocks(container: HTMLElement): void {
  container.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code.hljs, code[class*="language-"]');
    if (!code) return;

    applyHljsColors(code as HTMLElement);

    const table = document.createElement('table');
    table.setAttribute('style', 'width:100%;border-collapse:collapse;margin:10px 0;');
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.setAttribute(
      'style',
      `background:${PRE_BACKGROUND};color:${PRE_TEXT_COLOR};padding:14px 16px;font-size:9px;line-height:1.5;`
    );
    cell.innerHTML = code.innerHTML;
    row.appendChild(cell);
    table.appendChild(row);
    pre.replaceWith(table);
  });

  container.querySelectorAll('code:not(pre code)').forEach((code) => {
    code.setAttribute(
      'style',
      'background:#f4f4f5;color:#18181b;padding:2px 6px;font-size:10px;'
    );
  });
}

export const HLJS_PDF_PRE_FILL = PRE_BACKGROUND;
export const HLJS_PDF_PRE_TEXT = PRE_TEXT_COLOR;
