'use server';
/**
 * @fileOverview Generates an explanation for a given literary term.
 *
 * - generateExplanation - A function that generates an explanation for a literary term.
 * - GenerateExplanationInput - The input type for the generateExplanation function.
 * - GenerateExplanationOutput - The return type for the generateExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExplanationInputSchema = z.object({
  term: z.string().describe('需要解释的文学术语。'),
});
export type GenerateExplanationInput = z.infer<typeof GenerateExplanationInputSchema>;

const GenerateExplanationOutputSchema = z.object({
  explanation: z.string().describe('生成的对该文学术语的解释。'),
});
export type GenerateExplanationOutput = z.infer<typeof GenerateExplanationOutputSchema>;

export async function generateExplanation(input: GenerateExplanationInput): Promise<GenerateExplanationOutput> {
  return generateExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExplanationPrompt',
  input: {schema: GenerateExplanationInputSchema},
  output: {schema: GenerateExplanationOutputSchema},
  prompt: `你是一位文学领域的专家。请为以下文学术语提供一个清晰、准确且易于理解的定义，并满足长度与信息密度要求。

要求：
1. 采用中文解释，长度不少于 200 字且不多于 300 字。
2. 给出核心内涵、典型特征、与其他概念的区分点，以及一到两个代表性例子（可是作家/作品片段/史时期）。
3. 避免空泛陈述与重复语。

术语：{{term}}

定义：`,
});

const generateExplanationFlow = ai.defineFlow(
  {
    name: 'generateExplanationFlow',
    inputSchema: GenerateExplanationInputSchema,
    outputSchema: GenerateExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
