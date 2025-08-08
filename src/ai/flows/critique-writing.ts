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

const literaryStyles = ["海明威极简主义", "现实主义", "浪漫主义", "象征主义", "意识流", "超现实主义", "未来主义", "结构主义", "新批评", "精神分析"] as const;
const LiteraryStyleSchema = z.enum(literaryStyles);
export type LiteraryStyle = z.infer<typeof LiteraryStyleSchema>;


const CritiqueWritingInputSchema = z.object({
  textToCritique: z.string().describe('用户需要评价的写作内容。'),
  style: LiteraryStyleSchema.describe('用户选择的文学风格或批评方法。'),
});
export type CritiqueWritingInput = z.infer<typeof CritiqueWritingInputSchema>;

const SuggestionSchema = z.object({
    originalSegment: z.string().describe("需要修改的原始文本片段。"),
    suggestedChange: z.string().describe("针对该片段的具体修改建议。"),
    comment: z.string().describe("做出此修改的简要理由。"),
});

const EvaluationDimensionSchema = z.object({
    score: z.number().min(0).max(100).describe("一个 0 到 100 之间的整数，用于量化评价该维度的表现。分数越高越好。"),
    comment: z.string().describe("对该维度的详细文字评价。"),
});

const DetailedEvaluationSchema = z.object({
    themeAndIntention: EvaluationDimensionSchema.describe("对“主题与立意”的评价：核心思想是否明确、深刻，有无独特视角或价值。"),
    structureAndLogic: EvaluationDimensionSchema.describe("对“结构与逻辑”的评价：整体布局是否合理，段落衔接是否自然，叙事/论证线索是否清晰。"),
    languageAndExpression: EvaluationDimensionSchema.describe("对“语言与表达”的评价：用词精准度、生动性，修辞运用是否恰当，有无语病或冗余。"),
    charactersAndImagery: EvaluationDimensionSchema.describe("对“人物与形象”的评价：人物塑造是否立体，行为逻辑是否合理，形象是否鲜明。如果文本类型不涉及，请在评语中说明原因，分数为0。"),
    plotAndPacing: EvaluationDimensionSchema.describe("对“情节与节奏”的评价：情节设计是否紧凑、有张力，节奏把控是否张弛有度。如果文本类型不涉及，请在评语中说明原因，分数为0。"),
    innovationAndUniqueness: EvaluationDimensionSchema.describe("对“创新性与独特性”的评价：有无新颖的手法、角度或表达，是否避免平庸化。"),
});

const CritiqueWritingOutputSchema = z.object({
  evaluation: DetailedEvaluationSchema.describe('对写作内容的全方位、分模块评价。'),
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
  prompt: `你是一位专业的文学编辑和批评家，精通各种文学理论和批评方法。请根据用户选择的特定批评视角，对以下写作内容进行深入、专业、且富有建设性的评价和建议。

你的评价必须分为两个部分：

第一部分：分模块综合评价 (evaluation)
你必须严格按照以下六个维度进行评价。对于每个维度，你都需要提供两项内容：
1.  **score**: 一个从 0 到 100 的整数，用于量化评价该维度的表现。分数越高代表表现越好（例如：0-40 分表示差，41-70 分表示中等，71-100 分表示优秀）。
2.  **comment**: 详细的文字评价。**此评价必须严格运用你被指定的批评方法论**。例如，如果选择“精神分析”，你的评语中应包含关于潜意识、象征、原型等概念的分析。如果选择“结构主义”，应关注文本的二元对立、叙事结构等。

如果某个维度不适用于所提供的文本类型（例如，一篇议论文没有“情节”），请在该维度的 \`comment\` 中明确说明不适用的原因，并将 \`score\` 设为 0。

六个评价维度是：
1.  **主题与立意**：核心思想是否明确、深刻，有无独特视角或价值。
2.  **结构与逻辑**：整体布局是否合理，段落衔接是否自然，叙事/论证线索是否清晰。
3.  **语言与表达**：用词精准度、生动性，修辞运用是否恰当，有无语病或冗余。
4.  **人物与形象**（若涉及）：人物塑造是否立体，行为逻辑是否合理，形象是否鲜明。
5.  **情节与节奏**（若叙事）：情节设计是否紧凑、有张力，节奏把控是否张弛有度。
6.  **创新性与独特性**：有无新颖的手法、角度或表达，是否避免平庸化。

第二部分：具体修改建议 (suggestions)
这是一个**数组**，每个元素都是一个包含三个字段的对象：\`originalSegment\`、\`suggestedChange\` 和 \`comment\`。
*   \`originalSegment\`: **必须**是从用户原文中**精确、无修改地**提取的文本片段。
*   \`suggestedChange\`: 对 \`originalSegment\` 提出的修改方案。
*   \`comment\`: 解释为什么要做这个修改，**理由应与你采用的批评视角相关**。
*   请找出多个值得修改的地方，并为每个地方生成一个建议对象。

---
**批评视角**: {{style}}
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
