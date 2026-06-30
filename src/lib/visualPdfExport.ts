import html2pdf from 'html2pdf.js';

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export async function exportVisualPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  element.classList.add('pdf-exporting');
  await waitForPaint();

  try {
    const options = {
      margin: [12, 14, 12, 14] as [number, number, number, number],
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const,
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: [
          'tr',
          'img',
          'svg',
          'pre',
          'table',
          'blockquote',
          '.mermaid-rendered',
          'h1',
          'h2',
          'h3',
        ],
      },
      enableLinks: true,
    };

    await html2pdf()
      .set(options as object)
      .from(element)
      .save();
  } finally {
    element.classList.remove('pdf-exporting');
  }
}
