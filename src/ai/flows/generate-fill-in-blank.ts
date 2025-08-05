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
  term: z.string().describe('The literary term.'),
  explanation: z.string().describe('The explanation of the literary term.'),
});
export type GenerateFillInBlankExercisesInput = z.infer<typeof GenerateFillInBlankExercisesInputSchema>;

const GenerateFillInBlankExercisesOutputSchema = z.object({
  exercise: z.string().describe('A fill-in-the-blank exercise generated from the explanation.'),
});
export type GenerateFillInBlankExercisesOutput = z.infer<typeof GenerateFillInBlankExercisesOutputSchema>;

export async function generateFillInBlankExercises(input: GenerateFillInBlankExercisesInput): Promise<GenerateFillInBlankExercisesOutput> {
  return generateFillInBlankExercisesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFillInBlankExercisesPrompt',
  input: {schema: GenerateFillInBlankExercisesInputSchema},
  output: {schema: GenerateFillInBlankExercisesOutputSchema},
  prompt: `Generate a fill-in-the-blank exercise based on the following literary term and its explanation.

Term: {{term}}
Explanation: {{explanation}}

Exercise:`,
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
