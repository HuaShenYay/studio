'use server';
/**
 * @fileOverview Extracts literary terms and explanations from Markdown text.
 *
 * - extractTermsFromMarkdown - Extracts terms and explanations from Markdown.
 * - ExtractTermsFromMarkdownInput - Input type for the function.
 * - ExtractTermsFromMarkdownOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTermsFromMarkdownInputSchema = z.object({
  markdownContent: z
    .string()
    .describe('The Markdown text from which to extract terms.'),
});
export type ExtractTermsFromMarkdownInput = z.infer<
  typeof ExtractTermsFromMarkdownInputSchema
>;

const TermSchema = z.object({
  term: z.string().describe('识别出的文学术语。'),
  explanation: z.string().describe('该术语对应的解释。'),
});

const ExtractTermsFromMarkdownOutputSchema = z.object({
  extractedTerms: z
    .array(TermSchema)
    .describe('从文本中提取的文学术语和解释的列表。'),
});
export type ExtractTermsFromMarkdownOutput = z.infer<
  typeof ExtractTermsFromMarkdownOutputSchema
>;

export async function extractTermsFromMarkdown(
  input: ExtractTermsFromMarkdownInput
): Promise<ExtractTermsFromMarkdownOutput> {
  return extractTermsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTermsFromMarkdownPrompt',
  input: {schema: ExtractTermsFromMarkdownInputSchema},
  output: {schema: ExtractTermsFromMarkdownOutputSchema},
  prompt: `你是一个精通文学理论的AI助手。你的任务是从以下 Markdown 格式的文本中识别并提取所有的文学术语及其对应的解释。

请遵循以下规则：
1.  只提取明确定义的术语。如果一个术语没有附带解释，请不要包含它。
2.  确保提取的解释是完整且准确的。
3.  将结果格式化为一个包含术语（term）和解释（explanation）对象的数组。
4.  如果文本中没有找到任何术语和解释，请返回一个空数组。

Markdown 文本内容如下：
---
{{markdownContent}}
---
`,
});

const extractTermsFlow = ai.defineFlow(
  {
    name: 'extractTermsFromMarkdownFlow',
    inputSchema: ExtractTermsFromMarkdownInputSchema,
    outputSchema: ExtractTermsFromMarkdownOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);

      if (!output) {
        return {extractedTerms: []};
      }
      return output;
    } catch (error) {
      console.error('Error processing Markdown with AI model:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during Markdown processing.';
      throw new Error(`AI模型处理Markdown文本时出错: ${errorMessage}`);
    }
  }
);
