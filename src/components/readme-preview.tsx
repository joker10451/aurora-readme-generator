
'use client'

import { Copy, Check, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Textarea } from './ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'


interface ReadmePreviewProps {
  content: string
  onContentChange: (content: string) => void
  repoDetails: { owner: string; repo: string } | null
  logoDataUri: string | null
}

export function ReadmePreview({ content, onContentChange, repoDetails, logoDataUri }: ReadmePreviewProps) {
  const [hasCopied, setHasCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setHasCopied(true);
    toast({
      title: 'Copied!',
      description: 'README content copied to clipboard.',
    });
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
     toast({
      title: 'Downloaded!',
      description: 'README.md has been downloaded.',
    });
  }
  
  const logoMarkdownForPreview = logoDataUri ? `<p align="center"><img src="${logoDataUri}" alt="logo" width="120"></p>\n\n` : ''
  const fullContentForPreview = logoMarkdownForPreview + content;


  return (
    <Card className="h-full w-full shadow-lg border-primary/20 flex flex-col">
      <Tabs defaultValue="preview" className="w-full flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between bg-muted/50 p-2">
            <TabsList className="grid w-full grid-cols-2 max-w-sm">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handleDownload} disabled={!content}>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download README</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!content}>
                {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy README content</span>
                </Button>
            </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
           <TabsContent value="preview" className="m-0 h-full">
             <div className="prose prose-sm dark:prose-invert max-w-none p-4 md:p-6 h-full overflow-y-auto min-h-[400px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {fullContentForPreview}
                </ReactMarkdown>
             </div>
           </TabsContent>
           <TabsContent value="edit" className="m-0 h-full">
            <Textarea
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder={repoDetails === null ? "Enter a repository URL to get started..." : "Generate sections or start typing..."}
                className="w-full h-full min-h-[400px] bg-transparent resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            />
           </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
