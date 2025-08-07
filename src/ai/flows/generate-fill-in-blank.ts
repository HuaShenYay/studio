'use server';
/**
 * @fileOverview Generates fill-in-the-blank exercises from literary term explanations.
 *
 * - generateFillInBlankExercises - A function that generates fill-in-the-blank exercises.
 * - GenerateFillInBlankExercisesInput - The input type for the generateFillInBlankExercises function.
 * - GenerateFillInBlankExercisesOutput - The return type for the generateFillInBlankExercises function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFillInBlankExercisesInputSchema = z.object({
  term: z.string().describe('文学术语。'),
  explanation: z.string().describe('对该文学术语的解释。'),
});
export type GenerateFillInBlankExercisesInput = z.infer<typeof GenerateFillInBlankExercisesInputSchema>;

const GenerateFillInBlankExercisesOutputSchema = z.object({
  exercise: z.string().describe('生成的包含一个或多个下划线 (____) 的填空题。'),
  answers: z.array(z.string()).describe('一个包含所有正确答案的数组，按其在句子中出现的顺序列出。'),
});
export type GenerateFillInBlankExercisesOutput = z.infer<typeof GenerateFillInBlankExercisesOutputSchema>;

export async function generateFillInBlankExercises(input: GenerateFillInBlankExercisesInput): Promise<GenerateFillInBlankExercisesOutput> {
  return generateFillInBlankExercisesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFillInBlankExercisesPrompt',
  input: {schema: GenerateFillInBlankExercisesInputSchema},
  output: {schema: GenerateFillInBlankExercisesOutputSchema},
  prompt: `你是一位出题专家。根据以下文学术语及其解释，创建一个包含一个或多个填空的多项填空题。

要求：
1.  仔细阅读解释，识别出其中最关键的核心信息点（可以是术语本身，也可以是定义中的关键词）。
2.  将这些核心信息点从原句中移除，并用 "____" (四个下划线) 代替，形成填空题。
3.  确保题目自然流畅，能够有效考察对该术语的理解。
4.  在 'answers' 字段中，提供一个与空中下划线顺序完全对应的答案数组。

术语：{{term}}
解释：{{explanation}}

请生成练习题和答案：`,
});

const generateFillInBlankExercisesFlow = ai.defineFlow(
  {
    name: 'generateFillInBlankExercisesFlow',
    inputSchema: GenerateFillInBlankExercisesInputSchema,
    outputSchema: GenerateFillInBlankExercisesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
