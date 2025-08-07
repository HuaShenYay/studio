// This is a new file to isolate the pdf-parse library.

/**
 * Parses a PDF file from a Buffer.
 * This function encapsulates the pdf-parse library to isolate it from
 * the Next.js server component environment, which can have issues with
 * its native dependencies.
 * @param pdfBuffer The PDF content as a Node.js Buffer.
 * @returns A promise that resolves to the parsed PDF data.
 */
export async function parsePdfFromBuffer(pdfBuffer: Buffer): Promise<any> {
    try {
        // Dynamically require pdf-parse at runtime inside the function
        const pdf = require('pdf-parse');
        const data = await pdf(pdfBuffer);
        return data;
    } catch (error) {
        console.error('Failed to parse PDF buffer:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown PDF parsing error';
        throw new Error(`Error during PDF parsing: ${errorMessage}`);
    }
}
