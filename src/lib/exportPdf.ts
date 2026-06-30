export async function exportPdf(
  html: string,
  filename = 'document.pdf',
  previewRoot?: HTMLElement | null
): Promise<void> {
  if (!html.trim()) {
    throw new Error('Nada para exportar');
  }
  if (!previewRoot) {
    throw new Error('Preview indisponível. Abra a aba Preview e tente novamente.');
  }

  const { exportVisualPdf } = await import('./visualPdfExport');
  return exportVisualPdf(previewRoot, filename);
}
