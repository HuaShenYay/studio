'use server';
/**
 * @fileOverview Extracts plain text from a PDF file.
 *
 * - extractTextFromPdf - Converts a PDF file to plain text.
 * - ExtractTextFromPdfInput - Input type for the function.
 * - ExtractTextFromPdfOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { parsePdfFromBuffer } from '@/services/pdf-parser-service';


const ExtractTextFromPdfInputSchema = z.object({
  pdfUrl: z
    .string()
    .url()
    .describe(
      'The public URL of the PDF file. The model will access the file from this URL.'
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

export async function extractTextFromPdf(
  input: ExtractTextFromPdfInput
): Promise<ExtractTextFromPdfOutput> {
  return extractTextFromPdfFlow(input);
}


const extractTextFromPdfFlow = ai.defineFlow(
  {
    name: 'extractTextFromPdfFlow',
    inputSchema: ExtractTextFromPdfInputSchema,
    outputSchema: ExtractTextFromPdfOutputSchema,
  },
  async input => {
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
      console.error('Error in extractTextFromPdfFlow:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during PDF processing.';
      throw new Error(`PDF处理工作流失败: ${errorMessage}`);
    }
  }
);
