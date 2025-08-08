'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const literaryStyles = ["结构主义", "新批评", "精神分析", "读者反应批评", "女性主义批评", "后殖民主义批评", "马克思主义批评", "生态批评"] as const;
const LiteraryStyleSchema = z.enum(literaryStyles);
export type LiteraryStyle = z.infer<typeof LiteraryStyleSchema>;

const CritiqueAdviceInputSchema = z.object({
  topic: z.string().describe('评论对象或主题，如某篇作品、某段文本、某种文学现象'),
  era: z.enum(['中国古代', '中国现当代', '外国']).describe('时代/地域取向'),
  style: LiteraryStyleSchema.describe('选择一种文学批评理论或方法作为核心分析视角'),
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
  prompt: `你是一位资深文学评论写作指导教师，并且是一位深谙【{{style}}】理论的专家。请严格运用【{{style}}】的理论、术语和分析框架，为用户提供关于【{{topic}}】的评论写作建议。

你的输出必须包含三个部分：
1. 评论大纲要点 (outline): 提出一个逻辑清晰、完全基于【{{style}}】视角的评论结构大纲，不少于 6 个要点。
2. “论点-证据-分析”示例 (arguments): 提供 3-5 组示例。每一组都必须包含一个【{{style}}】的核心观点作为“论点”，从【{{topic}}】中找到合适的“证据”，并用【{{style}}】的理论进行“分析”。
3. 常见误区与建议 (pitfalls): 站在【{{style}}】的立场上，指出在评论【{{topic}}】时可能会出现的常见误区，并提出避免建议，至少 6 条。

【时代/地域】{{era}}
【评论对象/主题】{{topic}}
【核心批评方法】{{style}}
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
