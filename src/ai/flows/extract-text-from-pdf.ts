'use server';
/**
 * @fileOverview Extracts plain text from a PDF file.
 *
 * - extractTextFromPdf - Converts a PDF file to plain text.
 * - ExtractTextFromPdfInput - Input type for the function.
 * - ExtractTextFromPdfOutput - Output type for the function.
 */

import { z } from 'genkit';
import { parsePdfFromBuffer } from '@/services/pdf-parser-service';

// Define Zod schemas for input and output, even for a standard server function,
// to maintain type safety and clear contracts.
const ExtractTextFromPdfInputSchema = z.object({
  pdfUrl: z
    .string()
    .url()
    .describe(
      'The public URL of the PDF file. The function will access the file from this URL.'
    ),
});
export type ExtractTextFromPdfInput = z.infer<
  typeof ExtractTextFromPdfInputSchema
>;

const ExtractTextFromPdfOutputSchema = z.object({
  text: z.string().describe('The plain text content extracted from the PDF.'),
});
export type ExtractTextFromPdfOutput = z.infer<
  typeof ExtractTextFromPdfOutputSchema
>;


/**
 * A standard server function to extract text from a PDF.
 * This function does not need to be a Genkit flow as it performs a direct task
 * without complex orchestration or AI steps.
 * @param input The input object containing the PDF URL.
 * @returns An object containing the extracted text.
 */
export async function extractTextFromPdf(
  input: ExtractTextFromPdfInput
): Promise<ExtractTextFromPdfOutput> {
  try {
    // 1. Fetch the PDF from the URL
    const response = await fetch(input.pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const pdfBuffer = await response.arrayBuffer();

    // 2. Parse the PDF using the isolated service to get text
    const data = await parsePdfFromBuffer(Buffer.from(pdfBuffer));

    // 3. Return the extracted text
    return { text: data.text };

  } catch (error) {
    console.error('Error in extractTextFromPdf:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during PDF processing.';
    // Re-throw a user-friendly error to be caught by the calling component
    throw new Error(`PDF 处理失败: ${errorMessage}`);
  }
}
