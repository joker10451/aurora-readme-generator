
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Github, Wand2, Loader2, Image as ImageIcon, VenetianMask, Code2, Badge, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { GenerateReadmeSectionInput } from '@/ai/flows/generate-readme-section'
import React from 'react'
import { Separator } from './ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'

const formSchema = z.object({
  repoUrl: z.string().min(1, 'Repo URL is required').refine(
    (url) => {
      const githubUrlRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+)/
      const ownerRepoRegex = /^[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/
      return githubUrlRegex.test(url) || ownerRepoRegex.test(url)
    },
    { message: 'Please enter a valid GitHub URL or owner/repo string.' }
  ),
  customSectionName: z.string(),
  writingStyle: z.enum(['professional', 'friendly', 'concise']),
})

type SectionType = GenerateReadmeSectionInput['sectionType']
type Style = NonNullable<GenerateReadmeSectionInput['style']>;

const sectionTypes: { id: SectionType, name: string, icon: React.ElementType }[] = [
    { id: 'introduction', name: 'Introduction', icon: Wand2 },
    { id: 'features', name: 'Features', icon: Sparkles },
    { id: 'tech_stack', name: 'Tech Stack', icon: Code2 },
    { id: 'installation', name: 'Installation', icon: Wand2 },
    { id: 'usage', name: 'Usage', icon: Wand2 },
    { id: 'contributing', name: 'Contributing', icon: Wand2 },
    { id: 'license', name: 'License', icon: Wand2 },
]

interface ControlsProps {
  onRepoSubmit: (repoUrl: string) => void
  onGenerateSection: (sectionType: SectionType, customSectionName?: string) => Promise<void>
  onGenerateAll: () => Promise<void>
  onGenerateLogo: () => Promise<void>
  onAddBadge: (badgeMarkdown: string) => void
  onImproveReadme: () => Promise<void>
  isGenerating: SectionType | 'all' | 'logo' | 'improve' | null
  repoUrl: string | null
  repoDetails: { owner: string; repo: string } | null
  readmeContent: string
  style: Style
  onStyleChange: (style: Style) => void
}

const badgeOptions = [
    { label: 'License', type: 'license'},
    { label: 'Stars', type: 'stars', style: 'social'},
    { label: 'Forks', type: 'forks', style: 'social'},
    { label: 'Issues', type: 'issues-open'},
    { label: 'Pull Requests', type: 'issues-pr-open'},
    { label: 'Contributors', type: 'contributors'},
    { label: 'Last Commit', type: 'last-commit'},
    { label: 'Repo Size', type: 'repo-size'},
];

export function Controls({ 
    onRepoSubmit, 
    onGenerateSection, 
    onGenerateAll,
    onGenerateLogo,
    onAddBadge,
    onImproveReadme,
    isGenerating, 
    repoUrl,
    repoDetails,
    readmeContent,
    style,
    onStyleChange,
}: ControlsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { repoUrl: repoUrl || '', customSectionName: '', writingStyle: style },
  })

  React.useEffect(() => {
    form.setValue('repoUrl', repoUrl || '');
    form.setValue('writingStyle', style);
  }, [repoUrl, style, form]);

  function onRepoFormSubmit(values: z.infer<typeof formSchema>) {
    onRepoSubmit(values.repoUrl)
  }

  function onCustomSectionFormSubmit(values: z.infer<typeof formSchema>) {
    if (!values.customSectionName) return;
    onGenerateSection('custom', values.customSectionName);
    form.reset({ ...form.getValues(), customSectionName: '' });
  }

  const handleBadgeClick = (type: string, badgeStyle?: string) => {
    if (!repoDetails) return;
    const { owner, repo } = repoDetails;
    let url = `https://img.shields.io/github/${type}/${owner}/${repo}`;
    if (badgeStyle) {
        url += `?style=${badgeStyle}`
    }
    onAddBadge(`![${type}](${url})`);
  }
  
  const anyGenerationInProgress = !!isGenerating;

  return (
    <div className="p-4 md:p-8 space-y-8 rounded-lg border bg-card text-card-foreground shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onRepoFormSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="repoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-headline">GitHub Repository</FormLabel>
                <div className="flex items-center space-x-2">
                  <Github className="h-5 w-5 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="e.g., vercel/next.js" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={form.formState.isSubmitting || anyGenerationInProgress}>
             Set Repository
          </Button>
        </form>
        
        <Separator />

        <div className="space-y-4">
            <h3 className="text-lg font-headline">README Assist</h3>
            <p className="text-sm text-muted-foreground">
            Add sections, a logo, and badges to your README.
            </p>
            
            <FormField
                control={form.control}
                name="writingStyle"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Writing Style</FormLabel>
                        <Select onValueChange={(value: Style) => {
                            field.onChange(value);
                            onStyleChange(value);
                        }} defaultValue={field.value} disabled={anyGenerationInProgress}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a writing style" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="friendly">Friendly</SelectItem>
                                <SelectItem value="concise">Concise</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />

            <Accordion type="single" collapsible className="w-full" defaultValue="sections">
                <AccordionItem value="badges">
                    <AccordionTrigger className="text-base font-medium">
                        <div className="flex items-center gap-2">
                            <Badge className="h-5 w-5" />
                            Add Badges
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                         <p className="text-sm text-muted-foreground mb-4">Click to add a badge to your README.</p>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                           {badgeOptions.map(badge => (
                             <Button 
                                key={badge.label} 
                                type="button"
                                variant="outline"
                                onClick={() => handleBadgeClick(badge.type, badge.style)}
                                disabled={!repoUrl || anyGenerationInProgress}
                            >
                                {badge.label}
                            </Button>
                           ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="sections">
                    <AccordionTrigger className="text-base font-medium">
                        <div className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5" />
                            Create Sections
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {sectionTypes.map((section) => (
                                <Button 
                                    key={section.id} 
                                    type="button"
                                    variant="outline"
                                    onClick={() => onGenerateSection(section.id)}
                                    disabled={!repoUrl || anyGenerationInProgress}
                                >
                                    {isGenerating === section.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <section.icon className="mr-2 h-4 w-4" />
                                    )}
                                    {section.name}
                                </Button>
                            ))}
                        </div>
                        <form onSubmit={form.handleSubmit(onCustomSectionFormSubmit)} className="space-y-2 pt-4">
                           <FormField
                                control={form.control}
                                name="customSectionName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='sr-only'>Custom Section</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Custom section name..." {...field} disabled={!repoUrl || anyGenerationInProgress}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" variant="outline" disabled={!repoUrl || anyGenerationInProgress || !form.watch('customSectionName')}>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Create Custom Section
                            </Button>
                        </form>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            <div className="grid grid-cols-2 gap-3">
                <Button 
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={onGenerateAll}
                    disabled={!repoUrl || anyGenerationInProgress}
                >
                    {isGenerating === 'all' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <VenetianMask className="mr-2 h-4 w-4" />
                    )}
                    Create All
                </Button>
                
                <Button 
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={onGenerateLogo}
                    disabled={!repoUrl || anyGenerationInProgress}
                >
                    {isGenerating === 'logo' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <ImageIcon className="mr-2 h-4 w-4" />
                    )}
                    Create Logo
                </Button>
            </div>
            <Separator />
             <Button 
                type="button"
                className="w-full"
                onClick={onImproveReadme}
                disabled={!readmeContent || anyGenerationInProgress}
            >
                {isGenerating === 'improve' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Improve README
            </Button>
        </div>
      </Form>
    </div>
  )
}
