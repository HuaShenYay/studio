'use server';
/**
 * @fileOverview Provides writing critique based on a selected literary style.
 *
 * - critiqueWriting - A function that critiques a piece of writing.
 * - CritiqueWritingInput - The input type for the critiqueWriting function.
 * - CritiqueWritingOutput - The return type for the critiqueWriting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const literaryStyles = ["海明威风格", "意识流", "网络文学"] as const;
const LiteraryStyleSchema = z.enum(literaryStyles);
export type LiteraryStyle = z.infer<typeof LiteraryStyleSchema>;


const CritiqueWritingInputSchema = z.object({
  textToCritique: z.string().describe('用户需要评价的写作内容。'),
  style: LiteraryStyleSchema.describe('用户选择的文学风格。'),
});
export type CritiqueWritingInput = z.infer<typeof CritiqueWritingInputSchema>;

const CritiqueWritingOutputSchema = z.object({
  evaluation: z.string().describe('对写作内容的全方位评价，包括是否符合所选风格、基本功等方面。'),
  suggestions: z.string().describe('具体的修改建议，最好以列表形式呈现。'),
});
export type CritiqueWritingOutput = z.infer<typeof CritiqueWritingOutputSchema>;

export async function critiqueWriting(input: CritiqueWritingInput): Promise<CritiqueWritingOutput> {
  return critiqueWritingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'critiqueWritingPrompt',
  input: {schema: CritiqueWritingInputSchema},
  output: {schema: CritiqueWritingOutputSchema},
  prompt: `你是一位专业的文学编辑和写作导师。请根据用户选择的文学风格，对以下写作内容进行深入、专业、且富有建设性的评价和建议。

要求：
1.  **风格契合度分析**：首先，分析文本在多大程度上符合所选的【{{style}}】风格。如果符合，请指出具体体现在哪些方面；如果不符合，请说明原因。
2.  **写作基本功评价**：从以下几个方面评价文本：
    *   **语言**：用词是否精准、生动？句子结构是否清晰、有节奏感？
    *   **结构**：文章的开头、发展、高潮、结尾是否安排得当？逻辑是否连贯？
    *   **情感与表达**：文本是否能有效传达预期的情感或思想？感染力如何？
3.  **提出修改建议**：基于以上分析，提供具体、可操作的修改建议。建议应直接针对原文内容，可以提出删改、重写某些句子或段落的方案。
4.  **格式要求**：将最终结果分为“综合评价”和“修改建议”两部分。

---
**文学风格**: {{style}}
**待评价内容**:
{{textToCritique}}
---
`,
});

const critiqueWritingFlow = ai.defineFlow(
  {
    name: 'critiqueWritingFlow',
    inputSchema: CritiqueWritingInputSchema,
    outputSchema: CritiqueWritingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
