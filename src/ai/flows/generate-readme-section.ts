
'use server';

/**
 * @fileOverview AI-powered section generator for README files.
 *
 * - generateReadmeSection - A function that generates a README section based on repo information.
 * - GenerateReadmeSectionInput - The input type for the generateReadmeSection function.
 * - GenerateReadmeSectionOutput - The return type for the generateReadmeSection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fs from 'fs';
import path from 'path';

const GenerateReadmeSectionInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the GitHub repository.'),
  sectionType: z
    .enum([
      'introduction',
      'features',
      'installation',
      'usage',
      'contributing',
      'license',
      'tech_stack',
      'custom',
    ])
    .describe('The type of README section to generate.'),
  customSectionName: z.string().optional().describe('The name of the custom section, if sectionType is "custom".'),
  style: z.enum(['professional', 'friendly', 'concise']).optional().describe('The writing style for the generated content.'),
});
export type GenerateReadmeSectionInput = z.infer<typeof GenerateReadmeSectionInputSchema>;

const GenerateReadmeSectionOutputSchema = z.object({
  sectionContent: z.string().describe('The generated content for the README section, including a markdown header.'),
});
export type GenerateReadmeSectionOutput = z.infer<typeof GenerateReadmeSectionOutputSchema>;

export async function generateReadmeSection(input: GenerateReadmeSectionInput): Promise<GenerateReadmeSectionOutput> {
  return generateReadmeSectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReadmeSectionPrompt',
  input: {schema: GenerateReadmeSectionInputSchema.extend({
    techStackInstruction: z.string().optional(),
  })},
  output: {schema: GenerateReadmeSectionOutputSchema},
  prompt: `You are a helpful AI assistant that generates README sections for GitHub repositories.

  Based on the repository URL and the desired section type, create a relevant and informative section.
  
  Your response must start with a Markdown heading for the section (e.g., "## Introduction").

  {{{techStackInstruction}}}

  Your writing style should be: {{{style}}}.

  Repository URL: {{{repoUrl}}}
  Section To Generate: {{#if customSectionName}}{{customSectionName}}{{else}}{{sectionType}}{{/if}}
`,
});

const generateReadmeSectionFlow = ai.defineFlow(
  {
    name: 'generateReadmeSectionFlow',
    inputSchema: GenerateReadmeSectionInputSchema,
    outputSchema: GenerateReadmeSectionOutputSchema,
  },
  async input => {
    let techStackInstruction: string | undefined;
    if (input.sectionType === 'tech_stack') {
        try {
            const packageJsonPath = path.join(process.cwd(), 'package.json');
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageJsonContent);
            
            const dependencies = packageJson.dependencies ? Object.keys(packageJson.dependencies) : [];
            const devDependencies = packageJson.devDependencies ? Object.keys(packageJson.devDependencies) : [];
            
            const allDependencies = [...dependencies, ...devDependencies];

            if (allDependencies.length > 0) {
                techStackInstruction = `The project uses the following technologies based on its package.json: ${allDependencies.join(', ')}. Please create a nicely formatted list or section based on these.`;
            } else {
                 techStackInstruction = 'Analyze the repository to identify the main technologies, frameworks, and libraries used. Present them in a list.';
            }
        } catch (error) {
            console.error('Error reading or parsing package.json:', error);
            // Fallback to original method if reading fails
            techStackInstruction = 'Analyze the repository to identify the main technologies, frameworks, and libraries used. Present them in a list.';
        }
    }

    const {output} = await prompt({...input, techStackInstruction});
    return output!;
  }
);
