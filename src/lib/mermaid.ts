import mermaid from 'mermaid';

const PDF_MAX_WIDTH_PX = 500;

let initialized = false;
let diagramCounter = 0;

export function initMermaid(): void {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'strict',
    fontFamily: 'Inter, system-ui, sans-serif',
    flowchart: {
      htmlLabels: false,
      useMaxWidth: true,
    },
  });
  initialized = true;
}

function nextDiagramId(): string {
  diagramCounter += 1;
  return `mermaid-diagram-${diagramCounter}`;
}

export function createMermaidErrorHtml(message: string): string {
  const safe = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<pre class="mermaid-error" style="background:#0d1117;color:#f85149;padding:12px;border-radius:6px;font-size:10px;white-space:pre-wrap;">Mermaid: ${safe}</pre>`;
}

function getMermaidSource(node: HTMLElement): string {
  return node.getAttribute('data-source') ?? node.textContent?.trim() ?? '';
}

export async function renderMermaidInContainer(
  container: HTMLElement,
  isCancelled?: () => boolean
): Promise<void> {
  initMermaid();
  const nodes = Array.from(container.querySelectorAll<HTMLElement>('.mermaid'));
  if (nodes.length === 0) return;

  for (const node of nodes) {
    if (isCancelled?.()) return;

    const code = getMermaidSource(node);
    if (!code) continue;
    if (node.querySelector('svg')) continue;

    try {
      const id = nextDiagramId();
      const { svg, bindFunctions } = await mermaid.render(id, code);
      if (isCancelled?.()) return;

      node.innerHTML = svg;
      node.classList.add('mermaid-rendered');
      bindFunctions?.(node);
    } catch (error) {
      if (isCancelled?.()) return;
      const message =
        error instanceof Error ? error.message : 'Erro ao renderizar diagrama';
      node.innerHTML = createMermaidErrorHtml(message);
      node.classList.remove('mermaid');
    }
  }
}

function parseSvgDimensions(svg: string): { width: number; height: number } {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const svgEl = doc.documentElement;
  const viewBox = svgEl.getAttribute('viewBox')?.split(/\s+/).map(Number);

  let width = parseFloat(svgEl.getAttribute('width') || '0');
  let height = parseFloat(svgEl.getAttribute('height') || '0');

  if (viewBox && viewBox.length === 4) {
    if (!width) width = viewBox[2];
    if (!height) height = viewBox[3];
  }

  if (!width || !height) {
    width = PDF_MAX_WIDTH_PX;
    height = 200;
  }

  return { width, height };
}

function prepareMermaidSvgForPdf(svg: string, maxWidth: number): string {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const svgEl = doc.documentElement;

  if (doc.querySelector('parsererror')) {
    throw new Error('SVG inválido gerado pelo Mermaid');
  }

  const { width, height } = parseSvgDimensions(svg);
  const scale = width > maxWidth ? maxWidth / width : 1;
  const outputWidth = Math.round(width * scale);
  const outputHeight = Math.round(height * scale);

  svgEl.setAttribute('width', String(outputWidth));
  svgEl.setAttribute('height', String(outputHeight));
  if (!svgEl.getAttribute('xmlns')) {
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  svgEl.querySelectorAll('image').forEach((image) => {
    const href =
      image.getAttribute('href') ??
      image.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
    if (href && !href.startsWith('data:')) {
      image.remove();
    }
  });

  return svgEl.outerHTML;
}

export async function renderMermaidToSvg(
  code: string,
  id = nextDiagramId()
): Promise<string> {
  initMermaid();
  const { svg } = await mermaid.render(id, code);
  return prepareMermaidSvgForPdf(svg, PDF_MAX_WIDTH_PX);
}
