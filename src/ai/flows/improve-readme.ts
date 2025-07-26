'use server';

/**
 * @fileOverview An AI flow for improving an existing README.md file.
 *
 * - improveReadme - A function that takes README content and returns an improved version.
 * - ImproveReadmeInput - The input type for the improveReadme function.
 * - ImproveReadmeOutput - The return type for the improveReadme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveReadmeInputSchema = z.object({
  readmeContent: z.string().describe('The full content of the README.md file to be improved.'),
  style: z.enum(['professional', 'friendly', 'concise']).optional().describe('The desired writing style for the improved content.'),
});
export type ImproveReadmeInput = z.infer<typeof ImproveReadmeInputSchema>;

const ImproveReadmeOutputSchema = z.object({
  improvedContent: z.string().describe('The improved and revised content for the README.md file.'),
});
export type ImproveReadmeOutput = z.infer<typeof ImproveReadmeOutputSchema>;


export async function improveReadme(input: ImproveReadmeInput): Promise<ImproveReadmeOutput> {
  return improveReadmeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveReadmePrompt',
  input: {schema: ImproveReadmeInputSchema},
  output: {schema: ImproveReadmeOutputSchema},
  prompt: `You are an expert technical writer and AI assistant specializing in creating high-quality GitHub README files.

  Your task is to review the provided README.md content and improve it significantly.

  Follow these instructions:
  1.  **Correct Grammar and Spelling:** Fix any grammatical errors, spelling mistakes, and typos.
  2.  **Enhance Clarity and Conciseness:** Rephrase sentences to be clearer, more concise, and easier to understand.
  3.  **Ensure Professional Tone:** Maintain a professional and engaging tone suitable for a software project. The desired writing style is: {{{style}}}.
  4.  **Improve Formatting:** Ensure consistent and clean Markdown formatting. Use headings, lists, and code blocks effectively.
  5.  **Check for Completeness:** If you notice any obvious missing sections (like a "License" or "Usage" section if they seem necessary), you can add a placeholder for them, but prioritize improving the existing content.
  6.  **Do Not Change Core Meaning:** The goal is to improve the presentation and readability, not to alter the fundamental information or instructions.
  7.  **Preserve Code Blocks:** Do not modify the content inside code blocks (e.g., \`\`\`bash ... \`\`\`).
  8.  **Return the Full README:** Your output must be the complete, improved README content.

  Here is the README content to improve:
  ---
  {{{readmeContent}}}
  ---
`,
});

const improveReadmeFlow = ai.defineFlow(
  {
    name: 'improveReadmeFlow',
    inputSchema: ImproveReadmeInputSchema,
    outputSchema: ImproveReadmeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
