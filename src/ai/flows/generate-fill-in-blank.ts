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
  exercise: z.string().describe('根据解释生成的填空题。'),
});
export type GenerateFillInBlankExercisesOutput = z.infer<typeof GenerateFillInBlankExercisesOutputSchema>;

export async function generateFillInBlankExercises(input: GenerateFillInBlankExercisesInput): Promise<GenerateFillInBlankExercisesOutput> {
  return generateFillInBlankExercisesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFillInBlankExercisesPrompt',
  input: {schema: GenerateFillInBlankExercisesInputSchema},
  output: {schema: GenerateFillInBlankExercisesOutputSchema},
  prompt: `根据以下文学术语及其解释，生成一个填空练习题。在句子中用 "____" 代替术语本身。

术语：{{term}}
解释：{{explanation}}

练习题：`,
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
