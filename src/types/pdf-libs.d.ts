declare module 'pdfmake/build/pdfmake' {
  interface CreatedPdf {
    download(filename?: string): Promise<void>;
    getBlob(): Promise<Blob>;
  }

  interface PdfMake {
    vfs: Record<string, string>;
    createPdf(docDefinition: unknown): CreatedPdf;
  }

  const pdfMake: PdfMake;
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: Record<string, string>;
  export default vfs;
}

declare module 'html-to-pdfmake' {
  type HtmlToPdfmakeOptions = {
    window?: Window;
    tableAutoSize?: boolean;
    defaultStyles?: Record<string, unknown>;
    imagesByReference?: boolean;
    removeExtraBlanks?: boolean;
    removeTagClasses?: boolean;
  };

  type HtmlToPdfmakeResult =
    | unknown
    | unknown[]
    | { content: unknown | unknown[]; images?: Record<string, string> };

  function htmlToPdfmake(
    html: string,
    options?: HtmlToPdfmakeOptions
  ): HtmlToPdfmakeResult;

  export default htmlToPdfmake;
}
