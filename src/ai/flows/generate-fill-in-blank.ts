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
  explanation: z.string().describe('The explanation of the literary term (150-220 chars).'),
  blanks: z.number().int().min(2).max(8).default(3).describe('Desired number of blanks, default 3'),
});
export type GenerateFillInBlankExerciseInput = z.infer<typeof GenerateFillInBlankExerciseInputSchema>;

const GenerateFillInBlankExerciseOutputSchema = z.object({
  exercise: z.string().describe('Original text with blanks placed exactly where specified.'),
  answers: z.record(z.string()).describe('A JSON object where keys are the 0-based index and values are the exact substrings blanked out.'),
});
export type GenerateFillInBlankExerciseOutput = z.infer<typeof GenerateFillInBlankExerciseOutputSchema>;

// Internal schema for what the AI model will actually return.
const AIOutputSchema = z.object({
  exercise: z.string().optional().describe('Ignored by client; final exercise is constructed locally.'),
  answers: z.string().describe('A single string with exact substrings from the original text to blank out. Example: "0:文心雕龙;1:刘勰;2:文质彬彬"'),
});


export async function generateFillInBlankExercise(input: GenerateFillInBlankExerciseInput): Promise<GenerateFillInBlankExerciseOutput> {
  return generateFillInBlankExerciseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFillInBlankExercisePrompt',
  input: {schema: GenerateFillInBlankExerciseInputSchema},
  output: {schema: AIOutputSchema},
  prompt: `You will assist to create fill-in-the-blank directly from the ORIGINAL text, without rewriting.

Rules:
1) Do NOT paraphrase or recompose the text. The final question is built LOCALLY by replacing selected substrings with "____".
2) Provide ONLY the substrings to blank out in 'answers': exactly {{blanks}} non-overlapping substrings, copied verbatim from the original text. Include the term itself if present.
3) Prefer highly informative phrases: 书名、人名、理论术语、核心概念（2-8 汉字）。
4) Format strictly: 0:子串A;1:子串B;2:子串C（不要输出 JSON 或额外文字）。

Term: {{term}}
OriginalText: {{explanation}}
`,
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

    // Parse AI answers
    const parsedAnswers: Record<string, string> = {};
    const answerPairs = aiOutput.answers.split(';').map(s => s.trim()).filter(Boolean);
    for (const pair of answerPairs) {
      const idx = pair.indexOf(':');
      if (idx > 0) {
        const key = pair.slice(0, idx).trim();
        const value = pair.slice(idx + 1).trim();
        if (key && value) parsedAnswers[key] = value;
      }
    }

    // Construct blanks by replacing exact substrings in the original explanation
    let constructed = input.explanation;
    const substrings = Object.entries(parsedAnswers)
      .sort((a,b) => Number(a[0]) - Number(b[0]))
      .map(([,v]) => v);

    for (const s of substrings) {
      const pos = constructed.indexOf(s);
      if (pos !== -1) {
        constructed = constructed.slice(0, pos) + '____' + constructed.slice(pos + s.length);
      }
    }

    return {
      exercise: constructed,
      answers: parsedAnswers,
    };
  }
);
