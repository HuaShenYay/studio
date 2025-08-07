'use server';
/**
 * @fileOverview Extracts literary terms and explanations from plain text.
 *
 * - extractTermsFromText - Extracts terms and explanations from text.
 * - ExtractTermsFromTextInput - Input type for the function.
 * - ExtractTermsFromTextOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTermsFromTextInputSchema = z.object({
  textContent: z
    .string()
    .describe('The plain text from which to extract terms.'),
});
export type ExtractTermsFromTextInput = z.infer<
  typeof ExtractTermsFromTextInputSchema
>;

const TermSchema = z.object({
  term: z.string().describe('识别出的文学术语。'),
  explanation: z.string().describe('该术语对应的解释。'),
});

const ExtractTermsFromTextOutputSchema = z.object({
  extractedTerms: z
    .array(TermSchema)
    .describe('从文本中提取的文学术语和解释的列表。'),
});
export type ExtractTermsFromTextOutput = z.infer<
  typeof ExtractTermsFromTextOutputSchema
>;

export async function extractTermsFromText(
  input: ExtractTermsFromTextInput
): Promise<ExtractTermsFromTextOutput> {
  return extractTermsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTermsFromTextPrompt',
  input: {schema: ExtractTermsFromTextInputSchema},
  output: {schema: ExtractTermsFromTextOutputSchema},
  prompt: `你是一个精通文学理论的AI助手。你的任务是从以下文本中识别并提取所有的文学术语及其对应的解释。

请遵循以下规则：
1.  只提取明确定义的术语。如果一个术语没有附带解释，请不要包含它。
2.  确保提取的解释是完整且准确的。
3.  将结果格式化为一个包含术语（term）和解释（explanation）对象的数组。
4.  如果文本中没有找到任何术语和解释，请返回一个空数组。

文本内容如下：
---
{{textContent}}
---
`,
});

const extractTermsFlow = ai.defineFlow(
  {
    name: 'extractTermsFromTextFlow',
    inputSchema: ExtractTermsFromTextInputSchema,
    outputSchema: ExtractTermsFromTextOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);

      if (!output) {
        return {extractedTerms: []};
      }
      return output;
    } catch (error) {
      console.error('Error processing text with AI model:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during text processing.';
      throw new Error(`AI模型处理文本时出错: ${errorMessage}`);
    }
  }
);
