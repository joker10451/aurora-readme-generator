'use server';

/**
 * @fileOverview AI-powered logo generator for GitHub repositories.
 *
 * - generateLogo - A function that generates a logo based on a repository name.
 * - GenerateLogoInput - The input type for the generateLogo function.
 * - GenerateLogoOutput - The return type for the generateLogo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLogoInputSchema = z.object({
  repoName: z.string().describe('The name of the GitHub repository.'),
});
export type GenerateLogoInput = z.infer<typeof GenerateLogoInputSchema>;

const GenerateLogoOutputSchema = z.object({
  logoDataUri: z.string().describe("A logo for the repository, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateLogoOutput = z.infer<typeof GenerateLogoOutputSchema>;


export async function generateLogo(input: GenerateLogoInput): Promise<GenerateLogoOutput> {
  return generateLogoFlow(input);
}

const generateLogoFlow = ai.defineFlow(
  {
    name: 'generateLogoFlow',
    inputSchema: GenerateLogoInputSchema,
    outputSchema: GenerateLogoOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a simple, clean, modern, abstract logo for a software project called "${input.repoName}". The logo should be square and suitable for use on a white or light-colored background. Do not include any text in the logo.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error('Image generation failed to produce a result.');
    }

    return {
        logoDataUri: media.url
    };
  }
);
