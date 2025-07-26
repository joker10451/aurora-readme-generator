
'use client'

import { useState, useEffect } from 'react'
import { Github, Wand2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Controls } from '@/components/controls'
import { ReadmePreview } from '@/components/readme-preview'
import { generateSection, createLogo, improve } from './actions'
import { useToast } from '@/hooks/use-toast'
import type { GenerateReadmeSectionInput } from '@/ai/flows/generate-readme-section'

type RepoDetails = {
  owner: string
  repo: string
}

type SectionType = GenerateReadmeSectionInput['sectionType'];
type Style = NonNullable<GenerateReadmeSectionInput['style']>;

const ALL_SECTIONS: { id: SectionType, name: string }[] = [
    { id: 'introduction', name: 'Introduction' },
    { id: 'features', name: 'Features' },
    { id: 'tech_stack', name: 'Tech Stack' },
    { id: 'installation', name: 'Installation' },
    { id: 'usage', name: 'Usage' },
    { id: 'contributing', name: 'Contributing' },
    { id: 'license', name: 'License' },
];

export default function Home() {
  const [repoUrl, setRepoUrl] = useState<string | null>(null)
  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null)
  const [readmeContent, setReadmeContent] = useState<string>('')
  const [logoDataUri, setLogoDataUri] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState<SectionType | 'all' | 'logo' | 'improve' | null>(null)
  const [style, setStyle] = useState<Style>('professional')
  const { toast } = useToast()

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
        const savedState = localStorage.getItem('auroraReadmeState');
        if (savedState) {
            const { repoUrl, repoDetails, readmeContent, logoDataUri, style } = JSON.parse(savedState);
            setRepoUrl(repoUrl);
            setRepoDetails(repoDetails);
            setReadmeContent(readmeContent);
            setLogoDataUri(logoDataUri);
            setStyle(style);
        }
    } catch (error) {
        console.error("Failed to load state from localStorage", error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
        const stateToSave = JSON.stringify({ repoUrl, repoDetails, readmeContent, logoDataUri, style });
        localStorage.setItem('auroraReadmeState', stateToSave);
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
  }, [repoUrl, repoDetails, readmeContent, logoDataUri, style]);


  const parseRepoUrl = (url: string): RepoDetails | null => {
    const ownerRepoRegex = /^[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/;
    if (ownerRepoRegex.test(url)) {
      const [owner, repo] = url.split('/');
      return { owner, repo };
    }

    try {
      const urlObject = new URL(url.startsWith('http') ? url : `https://${url}`);
      const pathParts = urlObject.pathname.split('/').filter(Boolean);
      if (urlObject.hostname === 'github.com' && pathParts.length >= 2) {
        return { owner: pathParts[0], repo: pathParts[1] }
      }
    } catch (error) {
      return null
    }
    return null
  }

  const handleRepoSubmit = (url: string) => {
    const details = parseRepoUrl(url)
    if (details) {
      setRepoUrl(url)
      setRepoDetails(details)
      setReadmeContent(`# ${details.repo}`)
      setLogoDataUri(null)
      toast({
        title: 'Repository Set!',
        description: 'You can now generate sections for your README.',
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please provide a valid GitHub repository URL or owner/repo string.',
      })
    }
  }

  const handleGenerateSection = async (sectionType: SectionType, customSectionName?: string) => {
    if (!repoUrl) return

    setIsGenerating(sectionType);
    
    const result = await generateSection({ repoUrl, sectionType, style, customSectionName })
    
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: result.error,
      })
    } else if (result.content) {
      const prefix = readmeContent.trim() ? '\n\n' : '';
      setReadmeContent(prev => prev.trim() + prefix + result.content)
      toast({
        title: 'Section Added!',
        description: `The "${customSectionName || sectionType}" section has been added to your README.`,
      })
    }
    setIsGenerating(null)
  }

  const handleGenerateAll = async () => {
    if (!repoUrl || !repoDetails) return;
  
    setIsGenerating('all');
    
    let cumulativeContent = `# ${repoDetails.repo}`;
    setReadmeContent(cumulativeContent);
  
    for (const section of ALL_SECTIONS) {
      const result = await generateSection({ repoUrl, sectionType: section.id, style });
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: `Failed to create ${section.name}`,
          description: result.error,
        });
        break; // Stop on first error
      } else if (result.content) {
        const prefix = cumulativeContent.trim() && !cumulativeContent.endsWith('\n\n') ? '\n\n' : '';
        cumulativeContent += prefix + result.content;
        setReadmeContent(cumulativeContent);
      }
    }
  
    setIsGenerating(null);
    toast({
      title: 'README Generated!',
      description: 'The standard README sections have been created.',
    });
  };

  const handleGenerateLogo = async () => {
    if (!repoDetails) return;
    setIsGenerating('logo');
    const result = await createLogo({ repoName: repoDetails.repo });
    if (result.error) {
        toast({
            variant: 'destructive',
            title: 'Logo Creation Failed',
            description: result.error,
        });
    } else if (result.logoDataUri) {
        setLogoDataUri(result.logoDataUri);
        toast({
            title: 'Logo Created!',
            description: 'A new logo has been created for your project.',
        });
    }
    setIsGenerating(null);
  }

  const handleImproveReadme = async () => {
    if (!readmeContent) return;
    setIsGenerating('improve');
    const result = await improve({ readmeContent, style });
    if (result.error) {
        toast({
            variant: 'destructive',
            title: 'Improvement Failed',
            description: result.error,
        });
    } else if (result.content) {
        setReadmeContent(result.content);
        toast({
            title: 'README Improved!',
            description: 'Your README has been revised.',
        });
    }
    setIsGenerating(null);
  }

  const handleAddBadge = (badgeMarkdown: string) => {
    // Find the first newline to insert badges after the title
    const contentLines = readmeContent.split('\n');
    const titleIndex = contentLines.findIndex(line => line.startsWith('# '));

    if (titleIndex !== -1) {
        // Find the first empty line after the title
        let insertIndex = titleIndex + 1;
        while(insertIndex < contentLines.length && contentLines[insertIndex].trim() !== '') {
            insertIndex++;
        }
        
        // If no empty line, add one
        if (insertIndex === contentLines.length || (contentLines[insertIndex] && contentLines[insertIndex].trim() !== '')) {
            contentLines.splice(insertIndex, 0, '');
        }

        // Add badges after the empty line
        let badgeLineIndex = insertIndex + 1;
        if(badgeLineIndex >= contentLines.length || !contentLines[badgeLineIndex].includes('img.shields.io')) {
             contentLines.splice(badgeLineIndex, 0, '');
        }
       
        contentLines[badgeLineIndex] = (contentLines[badgeLineIndex] ? contentLines[badgeLineIndex] + ' ' : '') + badgeMarkdown;
        setReadmeContent(contentLines.join('\n'));

    } else {
         setReadmeContent(prev => `${badgeMarkdown} ${prev}`);
    }
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-headline">AuroraREADME</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
           <div className="lg:sticky lg:top-24 space-y-8">
            <Controls
              onRepoSubmit={handleRepoSubmit}
              onGenerateSection={handleGenerateSection}
              onGenerateAll={handleGenerateAll}
              onGenerateLogo={handleGenerateLogo}
              onAddBadge={handleAddBadge}
              onImproveReadme={handleImproveReadme}
              isGenerating={isGenerating}
              repoUrl={repoUrl}
              repoDetails={repoDetails}
              readmeContent={readmeContent}
              style={style}
              onStyleChange={setStyle}
            />
          </div>
          <div className="min-h-[calc(100vh-10rem)] lg:min-h-0">
            <ReadmePreview 
              content={readmeContent} 
              onContentChange={setReadmeContent}
              repoDetails={repoDetails} 
              logoDataUri={logoDataUri} 
            />
          </div>
        </div>
      </main>
    </div>
  )
}
