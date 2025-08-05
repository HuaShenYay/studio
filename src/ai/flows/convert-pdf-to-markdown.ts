'use server';
/**
 * @fileOverview Converts a PDF to Markdown format.
 *
 * - convertPdfToMarkdown - Converts a PDF file to Markdown text.
 * - ConvertPdfToMarkdownInput - Input type for the function.
 * - ConvertPdfToMarkdownOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertPdfToMarkdownInputSchema = z.object({
  pdfUrl: z
    .string()
    .url()
    .describe(
      'The public URL of the PDF file. The model will access the file from this URL.'
    ),
});
export type ConvertPdfToMarkdownInput = z.infer<
  typeof ConvertPdfToMarkdownInputSchema
>;

const ConvertPdfToMarkdownOutputSchema = z.object({
  markdown: z.string().describe('The Markdown content extracted from the PDF.'),
});
export type ConvertPdfToMarkdownOutput = z.infer<
  typeof ConvertPdfToMarkdownOutputSchema
>;

export async function convertPdfToMarkdown(
  input: ConvertPdfToMarkdownInput
): Promise<ConvertPdfToMarkdownOutput> {
  return convertPdfToMarkdownFlow(input);
}

const prompt = ai.definePrompt({
  name: 'convertPdfToMarkdownPrompt',
  input: {schema: ConvertPdfToMarkdownInputSchema},
  output: {schema: ConvertPdfToMarkdownOutputSchema},
  prompt: `你是一个文档处理专家。请将以下 PDF 文档的内容完整地转换为格式清晰的 Markdown 文本。

请保留原始的章节、标题、列表、表格和段落结构。

PDF 文档内容如下：
{{media url=pdfUrl}}
`,
});

const convertPdfToMarkdownFlow = ai.defineFlow(
  {
    name: 'convertPdfToMarkdownFlow',
    inputSchema: ConvertPdfToMarkdownInputSchema,
    outputSchema: ConvertPdfToMarkdownOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('AI model did not return any content.');
      }
      return output;
    } catch (error) {
      console.error('Error converting PDF to Markdown:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during PDF conversion.';
      throw new Error(`AI模型转换PDF时出错: ${errorMessage}`);
    }
  }
);
