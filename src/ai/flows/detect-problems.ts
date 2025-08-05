'use server';
/**
 * @fileOverview Detects potential problems in a given text.
 *
 * - detectProblems - A function that detects problems in a text.
 * - DetectProblemsInput - The input type for the detectProblems function.
 * - DetectProblemsOutput - The return type for the detectProblems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectProblemsInputSchema = z.object({
  text: z.string().describe('需要检测问题的文本。'),
});
export type DetectProblemsInput = z.infer<typeof DetectProblemsInputSchema>;

const ProblemSchema = z.object({
  problem: z.string().describe('识别出的具体问题。'),
  suggestion: z.string().describe('针对该问题提出的修改建议。'),
});

const DetectProblemsOutputSchema = z.object({
  problems: z.array(ProblemSchema).describe('从文本中检测到的问题和建议的列表。'),
});
export type DetectProblemsOutput = z.infer<typeof DetectProblemsOutputSchema>;

export async function detectProblems(input: DetectProblemsInput): Promise<DetectProblemsOutput> {
  return detectProblemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectProblemsPrompt',
  input: {schema: DetectProblemsInputSchema},
  output: {schema: DetectProblemsOutputSchema},
  prompt: `你是一位经验丰富的编辑。你的任务是仔细审查以下文本，找出其中所有潜在的问题，并为每个问题提供具体的修改建议。

请关注以下方面：
1.  **语法和拼写错误**：找出任何语法不规范或拼写错误的地方。
2.  **事实性错误**：如果文本中包含任何可疑或明显错误的信息，请指出来。
3.  **逻辑矛盾**：检查是否存在前后不一致或逻辑上的矛盾。
4.  **表述不清**：找出那些可能引起歧义或难以理解的句子。
5.  **风格不当**：如果文本的语气或风格不适合其上下文，请提出建议。

请将结果格式化为一个包含问题（problem）和建议（suggestion）对象的数组。如果文本中没有发现任何问题，请返回一个空数组。

需要分析的文本：
---
{{text}}
---
`,
});

const detectProblemsFlow = ai.defineFlow(
  {
    name: 'detectProblemsFlow',
    inputSchema: DetectProblemsInputSchema,
    outputSchema: DetectProblemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
