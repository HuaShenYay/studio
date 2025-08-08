'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CritiqueAdviceInputSchema = z.object({
  topic: z.string().describe('评论对象或主题，如某篇作品、某段文本、某种文学现象'),
  era: z.enum(['中国古代', '中国现当代', '外国']).describe('时代/地域取向'),
  focus: z.string().default('主题、结构、语言、意象、叙事策略').describe('评论关注点，逗号分隔'),
});
export type CritiqueAdviceInput = z.infer<typeof CritiqueAdviceInputSchema>;

const CritiqueAdviceOutputSchema = z.object({
  outline: z.array(z.string()).describe('建议的评论结构要点条目'),
  arguments: z.array(z.object({
    point: z.string(),
    evidence: z.string(),
    analysis: z.string(),
  })).describe('关键论点-证据-分析三要素'),
  pitfalls: z.array(z.string()).describe('常见误区与避免建议'),
});
export type CritiqueAdviceOutput = z.infer<typeof CritiqueAdviceOutputSchema>;

export async function generateCritiqueAdvice(input: CritiqueAdviceInput): Promise<CritiqueAdviceOutput> {
  return critiqueAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCritiqueAdvicePrompt',
  input: { schema: CritiqueAdviceInputSchema },
  output: { schema: CritiqueAdviceOutputSchema },
  prompt: `你是一位资深文学评论写作指导教师。请基于给定主题，产出：
1) 评论大纲要点（不少于6条，按逻辑顺序）；
2) 3-5 组“论点-证据-分析”示例；
3) 需要避免的常见误区与建议（至少6条）。

【时代/地域】{{era}}
【评论对象/主题】{{topic}}
【关注点】{{focus}}
  `,
});

const critiqueAdviceFlow = ai.defineFlow(
  {
    name: 'generateCritiqueAdviceFlow',
    inputSchema: CritiqueAdviceInputSchema,
    outputSchema: CritiqueAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);


