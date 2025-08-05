'use server';
/**
 * @fileOverview Extracts literary terms and explanations from a given PDF file.
 *
 * - extractTermsFromPdf - A function that extracts terms and explanations from a PDF.
 * - ExtractTermsInput - The input type for the function.
 * - ExtractTermsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTermsInputSchema = z.object({
  pdfUrl: z
    .string()
    .url()
    .describe(
      "The public URL of the PDF file. The model will access the file from this URL."
    ),
});
export type ExtractTermsInput = z.infer<typeof ExtractTermsInputSchema>;

const TermSchema = z.object({
  term: z.string().describe('识别出的文学术语。'),
  explanation: z.string().describe('该术语对应的解释。'),
});

const ExtractTermsOutputSchema = z.object({
  extractedTerms: z
    .array(TermSchema)
    .describe('从文本中提取的文学术语和解释的列表。'),
});
export type ExtractTermsOutput = z.infer<typeof ExtractTermsOutputSchema>;

export async function extractTermsFromPdf(
  input: ExtractTermsInput
): Promise<ExtractTermsOutput> {
  return extractTermsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTermsPrompt',
  input: { schema: ExtractTermsInputSchema },
  output: { schema: ExtractTermsOutputSchema },
  prompt: `你是一个精通文学理论的AI助手。你的任务是从以下 PDF 文档中识别并提取所有的文学术语及其对应的解释。

请遵循以下规则：
1.  只提取明确定义的术语。如果一个术语没有附带解释，请不要包含它。
2.  确保提取的解释是完整且准确的。
3.  将结果格式化为一个包含术语（term）和解释（explanation）对象的数组。
4.  如果文档中没有找到任何术语和解释，请返回一个空数组。

PDF 文档内容如下：
{{media url=pdfUrl}}
`,
});

const extractTermsFlow = ai.defineFlow(
  {
    name: 'extractTermsFlow',
    inputSchema: ExtractTermsInputSchema,
    outputSchema: ExtractTermsOutputSchema,
  },
  async (input) => {
    try {
      // The Gemini model can directly take a URL to a PDF file.
      // We pass the pdfUrl directly to the prompt.
      const { output } = await prompt(input);

      if (!output) {
        return { extractedTerms: [] };
      }
      return output;
      
    } catch (error) {
      console.error("Error processing PDF with AI model:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during PDF processing.';
      // Re-throw a more user-friendly error message.
      throw new Error(`AI模型处理PDF文件时出错: ${errorMessage}`);
    }
  }
);
