'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ArgumentEssayInputSchema = z.object({
  prompt: z.string().describe('论述题目/材料'),
  era: z.enum(['中国古代', '中国现当代', '外国']).describe('取材范围偏向'),
  length: z.number().int().min(300).max(1200).default(600).describe('建议字数'),
});
export type ArgumentEssayInput = z.infer<typeof ArgumentEssayInputSchema>;

const ArgumentEssayOutputSchema = z.object({
  thesis: z.string().describe('中心论点一句话'),
  outline: z.array(z.string()).describe('段落大纲'),
  paragraphHints: z.array(z.string()).describe('段落写作提示'),
  references: z.array(z.string()).describe('可引用的作品/理论/史料（若可能）'),
});
export type ArgumentEssayOutput = z.infer<typeof ArgumentEssayOutputSchema>;

export async function generateArgumentEssay(input: ArgumentEssayInput): Promise<ArgumentEssayOutput> {
  return argumentEssayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateArgumentEssayPrompt',
  input: { schema: ArgumentEssayInputSchema },
  output: { schema: ArgumentEssayOutputSchema },
  prompt: `你是文学考试辅导老师。根据论述题目/材料，给出：
1) 一句话中心论点；
2) 4-6 段落大纲；
3) 每段具体写作提示（包含例证方向与分析角度）；
4) 可引用的作品/理论/史料清单（不要求详注）。

【取材范围】{{era}}
【题目/材料】{{prompt}}
【建议字数】{{length}}
  `,
});

const argumentEssayFlow = ai.defineFlow(
  {
    name: 'generateArgumentEssayFlow',
    inputSchema: ArgumentEssayInputSchema,
    outputSchema: ArgumentEssayOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);


