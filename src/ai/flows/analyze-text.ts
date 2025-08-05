'use server';
/**
 * @fileOverview Analyzes a literary text from multiple perspectives.
 *
 * - analyzeText - A function that analyzes a given literary text.
 * - AnalyzeTextInput - The input type for the analyzeText function.
 * - AnalyzeTextOutput - The return type for the analyzeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextInputSchema = z.object({
  text: z.string().describe('需要分析的文学文本。'),
});
export type AnalyzeTextInput = z.infer<typeof AnalyzeTextInputSchema>;

const AnalyzeTextOutputSchema = z.object({
  theme: z.string().describe('对文本主题思想的分析。'),
  technique: z.string().describe('对文本写作手法的分析。'),
  imagery: z.string().describe('对文本关键意象的分析。'),
});
export type AnalyzeTextOutput = z.infer<typeof AnalyzeTextOutputSchema>;

export async function analyzeText(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  return analyzeTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: {schema: AnalyzeTextInputSchema},
  output: {schema: AnalyzeTextOutputSchema},
  prompt: `你是一位专业的文学评论家，请从以下三个维度对提供的文学文本进行深入分析：
1.  **主题思想**：探讨文本所传达的核心思想或主旨。
2.  **写作手法**：识别并分析文本中使用的修辞手法、叙事技巧或结构特点。
3.  **关键意象**：找出文本中的核心意象，并解释其象征意义。

请确保你的分析专业、简洁、切中要点。

需要分析的文本：
{{text}}
`,
});

const analyzeTextFlow = ai.defineFlow(
  {
    name: 'analyzeTextFlow',
    inputSchema: AnalyzeTextInputSchema,
    outputSchema: AnalyzeTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
