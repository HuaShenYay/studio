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
  exercise: z.string().describe('The generated fill-in-the-blank sentence with a single blank (____).'),
  answer: z.string().describe('The single correct answer for the blank.'),
});
export type GenerateFillInBlankExerciseOutput = z.infer<typeof GenerateFillInBlankExerciseOutputSchema>;

export async function generateFillInBlankExercise(input: GenerateFillInBlankExerciseInput): Promise<GenerateFillInBlankExerciseOutput> {
  return generateFillInBlankExerciseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFillInBlankExercisePrompt',
  input: {schema: GenerateFillInBlankExerciseInputSchema},
  output: {schema: GenerateFillInBlankExerciseOutputSchema},
  prompt: `You are an expert in creating educational materials. Based on the literary term and its explanation below, create a single fill-in-the-blank question.

Requirements:
1.  Use the provided explanation as the body of the question.
2.  Replace the literary term itself within the explanation with a single blank space represented by "____" (four underscores).
3.  The 'exercise' field in the output should contain the modified explanation with the blank.
4.  The 'answer' field in the output should contain the original literary term.

Term: {{term}}
Explanation: {{explanation}}

Generate the exercise and the answer.`,
});

const generateFillInBlankExerciseFlow = ai.defineFlow(
  {
    name: 'generateFillInBlankExerciseFlow',
    inputSchema: GenerateFillInBlankExerciseInputSchema,
    outputSchema: GenerateFillInBlankExerciseOutputSchema,
  },
  async input => {
    // A simple implementation for now: replace the term in the explanation with a blank.
    // The AI prompt is set up for a more robust implementation in the future.
    const exercise = input.explanation.replace(new RegExp(input.term, 'ig'), '____');
    
    // If the term wasn't found and replaced, create a simple blank-filling exercise.
    if (exercise === input.explanation) {
      return {
        exercise: `____: ${input.explanation}`,
        answer: input.term,
      };
    }

    return {
      exercise: exercise,
      answer: input.term,
    };
  }
);
