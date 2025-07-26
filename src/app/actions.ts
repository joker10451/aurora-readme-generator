
'use server'

import { generateReadmeSection, type GenerateReadmeSectionInput } from '@/ai/flows/generate-readme-section'
import { generateLogo, type GenerateLogoInput } from '@/ai/flows/generate-logo'
import { improveReadme, type ImproveReadmeInput } from '@/ai/flows/improve-readme'


export async function generateSection(input: GenerateReadmeSectionInput): Promise<{ content?: string, error?: string }> {
  try {
    const result = await generateReadmeSection(input)
    return { content: result.sectionContent }
  } catch (error) {
    console.error('Content creation failed:', error)
    return { error: 'Failed to create section. Please try again.' }
  }
}

export async function createLogo(input: GenerateLogoInput): Promise<{ logoDataUri?: string, error?: string }> {
    try {
        const result = await generateLogo(input)
        return { logoDataUri: result.logoDataUri }
    } catch (error) {
        console.error('Logo creation failed:', error)
        return { error: 'Failed to create logo. Please try again.' }
    }
}

export async function improve(input: ImproveReadmeInput): Promise<{ content?: string, error?: string }> {
    try {
        const result = await improveReadme(input)
        return { content: result.improvedContent }
    } catch (error) {
        console.error('Improvement failed:', error)
        return { error: 'Failed to improve README. Please try again.' }
    }
}
