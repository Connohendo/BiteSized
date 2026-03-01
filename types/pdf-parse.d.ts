declare module "pdf-parse" {
  function pdfParse(
    dataBuffer: Buffer,
    options?: { max?: number }
  ): Promise<{ text: string; numpages: number; info?: unknown }>;
  export default pdfParse;
}
