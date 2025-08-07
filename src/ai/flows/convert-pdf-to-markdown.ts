'use server';
/**
 * @fileOverview Converts a PDF to a condensed Markdown file containing only key term explanations.
 * This flow works in chunks to handle large documents efficiently.
 *
 * - convertPdfToMarkdown - Converts a PDF file to Markdown text.
 * - ConvertPdfToMarkdownInput - Input type for the function.
 * - ConvertPdfToMarkdownOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import pdf from 'pdf-parse';

// Define Zod schemas for input and output, but do not export them.
const ConvertPdfToMarkdownInputSchema = z.object({
  pdfUrl: z
    .string()
    .url()
    .describe(
      'The public URL of the PDF file. The model will access the file from this URL.'
    ),
});
export type ConvertPdfToMarkdownInput = z.infer<
  typeof ConvertPdfToMarkdownInputSchema
>;

const ConvertPdfToMarkdownOutputSchema = z.object({
  markdown: z.string().describe('The Markdown content extracted from the PDF.'),
});
export type ConvertPdfToMarkdownOutput = z.infer<
  typeof ConvertPdfToMarkdownOutputSchema
>;

// Define a Zod schema for the intermediate step of extracting text from a chunk.
const ExtractPossibleTermsOutputSchema = z.object({
    possibleTermExplanations: z.array(z.string()).describe(
        'An array of paragraphs that appear to be definitions or explanations of literary terms.'
    ),
});

// Define the prompt for the intermediate extraction step.
const extractPossibleTermsPrompt = ai.definePrompt({
    name: 'extractPossibleTermsPrompt',
    input: { schema: z.object({ textChunk: z.string() }) },
    output: { schema: ExtractPossibleTermsOutputSchema },
    prompt: `你是一个文学研究助理。你的任务是从以下文本块中，提取出所有可能是文学术语解释的段落。

请遵循以下规则：
1. 只提取那些看起来像是在定义或解释一个概念的完整段落。
2. 忽略那些明显是叙事、举例或与术语定义无关的内容。
3. 如果没有找到任何可能的术语解释，请返回一个空数组。

文本块内容如下：
---
{{textChunk}}
---
`,
});


export async function convertPdfToMarkdown(
  input: ConvertPdfToMarkdownInput
): Promise<ConvertPdfToMarkdownOutput> {
  return convertPdfToMarkdownFlow(input);
}


const convertPdfToMarkdownFlow = ai.defineFlow(
  {
    name: 'convertPdfToMarkdownFlow',
    inputSchema: ConvertPdfToMarkdownInputSchema,
    outputSchema: ConvertPdfToMarkdownOutputSchema,
  },
  async input => {
    try {
        // 1. Fetch the PDF from the URL
        const response = await fetch(input.pdfUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }
        const pdfBuffer = await response.arrayBuffer();
        
        // 2. Parse the PDF to get text and page count
        // Crucially, pdf-parse expects a Node.js Buffer, not an ArrayBuffer.
        const nodeBuffer = Buffer.from(pdfBuffer);
        const data = await pdf(nodeBuffer);
        const numPages = data.numpages;

        // 3. Process the PDF in chunks of 5 pages
        const chunkSize = 5;
        let allExplanations: string[] = [];
        let currentPageText = '';
        let pageCounter = 0;

        // Split text by form feed character which often separates pages
        const pages = data.text.split(/\f/g);

        for (let i = 0; i < pages.length; i++) {
            currentPageText += pages[i] + '\n\n';
            pageCounter++;

            if (pageCounter === chunkSize || i === pages.length - 1) {
                 console.log(`Processing pages...`);
                
                if (currentPageText.trim().length === 0) {
                    pageCounter = 0;
                    currentPageText = '';
                    continue;
                }

                // 4. Call AI to extract possible terms from the chunk
                const { output } = await extractPossibleTermsPrompt({ textChunk: currentPageText });

                if (output?.possibleTermExplanations) {
                    allExplanations.push(...output.possibleTermExplanations);
                }
                
                // Reset for the next chunk
                pageCounter = 0;
                currentPageText = '';
            }
        }

        // 5. Combine all extracted explanations into a single Markdown string
        if (allExplanations.length === 0) {
            return { markdown: 'AI模型未在文档中发现任何潜在的术语解释。' };
        }

        const finalMarkdown = allExplanations
            .map(exp => exp.trim())
            .join('\n\n---\n\n');

        return { markdown: finalMarkdown };

    } catch (error) {
      console.error('Error in convertPdfToMarkdownFlow:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during PDF processing.';
      throw new Error(`PDF处理工作流失败: ${errorMessage}`);
    }
  }
);
