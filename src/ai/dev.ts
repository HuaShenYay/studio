import { config } from 'dotenv';
config();

import '@/ai/flows/generate-fill-in-blank.ts';
import '@/ai/flows/generate-explanation.ts';
import '@/ai/flows/convert-pdf-to-markdown.ts';
import '@/ai/flows/extract-terms-from-markdown.ts';
