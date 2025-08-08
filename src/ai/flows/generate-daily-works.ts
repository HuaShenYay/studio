'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailyWorksInputSchema = z.object({
  count: z.number().int().min(3).max(6).default(3),
});
export type DailyWorksInput = z.infer<typeof DailyWorksInputSchema>;

const DailyWorkSchema = z.object({
  era: z.enum(['中国古代','中国现当代','外国']),
  title: z.string(),
  author: z.string(),
  snippet: z.string(),
});

const DailyWorksOutputSchema = z.object({
  items: z.array(DailyWorkSchema),
});
export type DailyWorksOutput = z.infer<typeof DailyWorksOutputSchema>;

export async function generateDailyWorks(input: DailyWorksInput = { count: 3 }): Promise<DailyWorksOutput> {
  return dailyWorksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyWorksPrompt',
  input: { schema: DailyWorksInputSchema },
  output: { schema: DailyWorksOutputSchema },
  prompt: `你是文学选读推荐助理。请生成 {count} 条“每日作品选”，满足：
1) 三个时代/地域均衡覆盖（中国古代、中国现当代、外国）；
2) 每条包含 era、title、author 和 snippet；
3) 如果作品为长篇/戏剧，请给出最具代表性的场景/名句作为 snippet；
5)尽量给出冷门的，不常见的，但有代表性的作品，不要总是重复出现（要求你每次看到这条prompt时，去发散到其它语句。）
4) 用中文输出。`,
});

const dailyWorksFlow = ai.defineFlow(
  {
    name: 'generateDailyWorksFlow',
    inputSchema: DailyWorksInputSchema,
    outputSchema: DailyWorksOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);



