export async function exportPdf(
  html: string,
  filename = 'document.pdf'
): Promise<void> {
  const { createPdfDownload } = await import('./pdfEngine');
  return createPdfDownload(html, filename);
}
