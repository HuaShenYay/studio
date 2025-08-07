'use server';
/**
 * @fileOverview Generates a fill-in-the-blank exercise from a literary term and its explanation.
 *
 * - generateFillInBlankExercise - A function that generates a fill-in-the-blank exercise.
 * - GenerateFillInBlankExerciseInput - The input type for the generateFillInBlankExercise function.
 * - GenerateFillInBlankExerciseOutput - The return type for the generateFillInBlankExercise function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFillInBlankExerciseInputSchema = z.object({
  term: z.string().describe('The literary term.'),
  explanation: z.string().describe('The explanation of the literary term.'),
});
export type GenerateFillInBlankExerciseInput = z.infer<typeof GenerateFillInBlankExerciseInputSchema>;

const GenerateFillInBlankExerciseOutputSchema = z.object({
  exercise: z.string().describe('A sentence with one or more blanks, each represented by "____" (four underscores).'),
  answers: z.record(z.string()).describe('A JSON object where keys are the 0-based index of the blank (as a string) and values are the correct answers.'),
});
export type GenerateFillInBlankExerciseOutput = z.infer<typeof GenerateFillInBlankExerciseOutputSchema>;

export async function generateFillInBlankExercise(input: GenerateFillInBlankExerciseInput): Promise<GenerateFillInBlankExerciseOutput> {
  return generateFillInBlankExerciseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFillInBlankExercisePrompt',
  input: {schema: GenerateFillInBlankExerciseInputSchema},
  output: {schema: GenerateFillInBlankExerciseOutputSchema},
  prompt: `You are an expert in creating educational materials. Based on the literary term and its explanation below, create a multi-blank fill-in-the-blank question.

Requirements:
1.  The question should be derived from the explanation.
2.  Replace the literary term itself, and at least one other key concept, with a blank space represented by "____" (four underscores). Create at least two blanks.
3.  The 'exercise' field in the output should contain the modified explanation with the blanks.
4.  The 'answers' field in the output must be a JSON object. The keys should be the 0-based index of each blank (as a string, e.g., "0", "1"). The values should be the corresponding correct words for the blanks. The term itself should be the answer for one of the blanks.

Term: {{term}}
Explanation: {{explanation}}

Generate the exercise and the answer object.`,
});

const generateFillInBlankExerciseFlow = ai.defineFlow(
  {
    name: 'generateFillInBlankExerciseFlow',
    inputSchema: GenerateFillInBlankExerciseInputSchema,
    outputSchema: GenerateFillInBlankExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
