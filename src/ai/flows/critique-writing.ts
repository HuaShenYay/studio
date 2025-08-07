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

const literaryStyles = ["海明威极简主义", "现实主义", "浪漫主义", "象征主义", "意识流", "超现实主义", "未来主义"] as const;
const LiteraryStyleSchema = z.enum(literaryStyles);
export type LiteraryStyle = z.infer<typeof LiteraryStyleSchema>;


const CritiqueWritingInputSchema = z.object({
  textToCritique: z.string().describe('用户需要评价的写作内容。'),
  style: LiteraryStyleSchema.describe('用户选择的文学风格。'),
});
export type CritiqueWritingInput = z.infer<typeof CritiqueWritingInputSchema>;

const SuggestionSchema = z.object({
    originalSegment: z.string().describe("需要修改的原始文本片段。"),
    suggestedChange: z.string().describe("针对该片段的具体修改建议。"),
    comment: z.string().describe("做出此修改的简要理由。"),
});

const CritiqueWritingOutputSchema = z.object({
  evaluation: z.string().describe('对写作内容的全方位评价，涵盖风格契合度、语言、结构、情感表达等方面。'),
  suggestions: z.array(SuggestionSchema).describe('一个包含具体修改建议的数组。每个建议都应针对原文中的一个特定片段。'),
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
1.  **综合评价 (evaluation)**:
    *   风格契合度分析：分析文本在多大程度上符合所选的【{{style}}】风格。
    *   写作基本功评价：从语言、结构、情感与表达等方面进行综合评价。
    *   这部分应是一个完整的、连贯的段落。

2.  **具体修改建议 (suggestions)**:
    *   这是一个**数组**，每个元素都是一个包含三个字段的对象：\`originalSegment\`、\`suggestedChange\` 和 \`comment\`。
    *   \`originalSegment\`: **必须**是从用户原文中**精确、无修改地**提取的文本片段。
    *   \`suggestedChange\`: 对 \`originalSegment\` 提出的修改方案。
    *   \`comment\`: 解释为什么要做这个修改。
    *   请找出多个值得修改的地方，并为每个地方生成一个建议对象。

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
