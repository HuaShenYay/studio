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

// Internal schema for what the AI model will actually return.
const AIOutputSchema = z.object({
  exercise: z.string().describe('A sentence with one or more blanks, each represented by "____" (four underscores).'),
  answers: z.string().describe('A single string containing all answers. Each answer is identified by its 0-based index, followed by a colon, and separated by a semicolon. Example: "0:Sonnet;1:fourteen lines"'),
});


export async function generateFillInBlankExercise(input: GenerateFillInBlankExerciseInput): Promise<GenerateFillInBlankExerciseOutput> {
  return generateFillInBlankExerciseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFillInBlankExercisePrompt',
  input: {schema: GenerateFillInBlankExerciseInputSchema},
  output: {schema: AIOutputSchema},
  prompt: `You are an expert in creating educational materials. Based on the literary term and its explanation below, create a multi-blank fill-in-the-blank question.

Requirements:
1.  The question should be derived from the explanation.
2.  Replace the literary term itself, and at least one other key concept, with a blank space represented by "____" (four underscores). Create at least two blanks.
3.  The 'exercise' field in the output should contain the modified explanation with the blanks.
4.  The 'answers' field in the output must be a single string. In this string, each answer must be identified by its 0-based index followed by a colon, with each key-value pair separated by a semicolon. For example: "0:Sonnet;1:rhyme scheme". Do not use JSON.

Term: {{term}}
Explanation: {{explanation}}

Generate the exercise and the answer string.`,
});

const generateFillInBlankExerciseFlow = ai.defineFlow(
  {
    name: 'generateFillInBlankExerciseFlow',
    inputSchema: GenerateFillInBlankExerciseInputSchema,
    outputSchema: GenerateFillInBlankExerciseOutputSchema,
  },
  async input => {
    const {output: aiOutput} = await prompt(input);
    if (!aiOutput) {
        throw new Error('AI failed to generate an exercise.');
    }

    // Parse the answer string into a JSON object
    const parsedAnswers: Record<string, string> = {};
    const answerPairs = aiOutput.answers.split(';');
    for (const pair of answerPairs) {
        const parts = pair.split(':');
        if (parts.length === 2) {
            const key = parts[0].trim();
            const value = parts[1].trim();
            parsedAnswers[key] = value;
        }
    }

    return {
        exercise: aiOutput.exercise,
        answers: parsedAnswers,
    };
  }
);
