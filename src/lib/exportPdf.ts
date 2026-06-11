import html2pdf from 'html2pdf.js';

export async function exportPdf(
  element: HTMLElement,
  filename = 'document.pdf'
): Promise<void> {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = '210mm';
  clone.style.padding = '0';
  clone.style.background = '#ffffff';

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.width = '210mm';
  wrapper.style.background = '#ffffff';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    await html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(clone)
      .save();
  } finally {
    document.body.removeChild(wrapper);
  }
}
