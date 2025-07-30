import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Save, 
  ArrowLeft, 
  Bold, 
  Italic, 
  List, 
  Quote, 
  Hash,
  Heart,
  Tag,
  FileText,
  Zap,
  Smile,
  Brain,
  Lightbulb,
  Folder
} from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import type { Post, AIFeedbackMode, Folder } from '../types'
import { blink } from '../blink/client'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface WritingInterfaceProps {
  post?: Post
  onSave: (post: Partial<Post>) => void
  onBack: () => void
}

const MOODS = ['😊', '😢', '😰', '😡', '🤔', '😴', '🎉', '💪', '🙏', '❤️']

export const WritingInterface = ({ post, onSave, onBack }: WritingInterfaceProps) => {
  const { createPost, updatePost } = usePosts()
  const { user } = useAuth()
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [selectedMood, setSelectedMood] = useState(post?.mood || '')
  const [tags, setTags] = useState<string[]>(post?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [isFavorite, setIsFavorite] = useState(post?.isFavorite || false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(post?.folderId || null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false)
  const [aiProfessionalFeedback, setAiProfessionalFeedback] = useState(post?.aiProfessionalFeedback || '')
  const [aiHumorousFeedback, setAiHumorousFeedback] = useState(post?.aiHumorousFeedback || '')
  const [feedbackMode, setFeedbackMode] = useState<AIFeedbackMode>('professional')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [writingStartTime] = useState(new Date())
  
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveRef = useRef<NodeJS.Timeout>()

  // Calculate writing stats
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length
    setWordCount(words)
    setReadingTime(Math.max(1, Math.ceil(words / 200))) // 200 words per minute average
  }, [content])

  // Fetch user's folders
  useEffect(() => {
    const fetchFolders = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('folders')
          .select('*')
          .eq('user_id', user.id)
          .order('name')

        if (error) throw error

        const transformedFolders: Folder[] = (data || []).map((folder: any) => ({
          id: folder.id,
          userId: folder.user_id,
          name: folder.name,
          isPasswordProtected: folder.is_password_protected || false,
          passwordHash: folder.password_hash,
          createdAt: folder.created_at,
          updatedAt: folder.updated_at,
          postCount: folder.post_count || 0
        }))

        setFolders(transformedFolders)
      } catch (error) {
        console.error('Error fetching folders:', error)
      }
    }

    fetchFolders()
  }, [user])

  // Auto-save functionality (disabled for now to avoid circular dependencies)
  // useEffect(() => {
  //   if (autoSaveRef.current) {
  //     clearTimeout(autoSaveRef.current)
  //   }
    
  //   if (title || content) {
  //     autoSaveRef.current = setTimeout(() => {
  //       handleSave(false)
  //     }, 3000) // Auto-save after 3 seconds of inactivity
  //   }

  //   return () => {
  //     if (autoSaveRef.current) {
  //       clearTimeout(autoSaveRef.current)
  //     }
  //   }
  // }, [title, content, selectedMood, tags, isFavorite])

  const generateAIFeedback = useCallback(async () => {
    if (!content.trim()) return

    setIsGeneratingFeedback(true)
    try {
      // Generate professional feedback
      const professionalPrompt = `As a professional counselor, provide thoughtful, empathetic feedback on this journal entry. Focus on emotional insights, coping strategies, and positive reinforcement. Keep it supportive and constructive:\n\n"${content}"`
      
      const professionalResponse = await blink.ai.generateText({
        prompt: professionalPrompt,
        maxTokens: 200
      })

      // Generate humorous feedback
      const humorousPrompt = `As a sarcastic but ultimately caring friend, provide witty, slightly irreverent feedback on this journal entry. Use humor, light teasing, and casual language. Be funny but not mean-spirited:\n\n"${content}"`
      
      const humorousResponse = await blink.ai.generateText({
        prompt: humorousPrompt,
        maxTokens: 200
      })

      setAiProfessionalFeedback(professionalResponse.text)
      setAiHumorousFeedback(humorousResponse.text)
      
      // Update the post with the new feedback if we have a post ID
      if (post?.id) {
        await updatePost(post.id, {
          aiProfessionalFeedback: professionalResponse.text,
          aiHumorousFeedback: humorousResponse.text
        })
      }
    } catch (error) {
      console.error('Failed to generate AI feedback:', error)
    } finally {
      setIsGeneratingFeedback(false)
    }
  }, [content, post?.id, updatePost])

  const handleSave = useCallback(async (showFeedback = true) => {
    if (!title.trim() && !content.trim()) return

    const postData: Partial<Post> = {
      title: title.trim() || 'Untitled',
      content: content.trim(),
      mood: selectedMood,
      tags,
      isFavorite,
      folderId: selectedFolderId,
      wordCount,
      readingTime,
      aiProfessionalFeedback,
      aiHumorousFeedback
    }

    try {
      let savedPost: Post | null = null
      
      if (post?.id) {
        // Update existing post
        savedPost = await updatePost(post.id, postData)
      } else {
        // Create new post
        savedPost = await createPost(postData)
      }

      if (savedPost) {
        setLastSaved(new Date())
        onSave(savedPost) // Notify parent component
        
        // Generate AI feedback if content is substantial and user wants it
        if (showFeedback && content.trim().length > 50) {
          await generateAIFeedback()
        }
      }
    } catch (error) {
      console.error('Failed to save post:', error)
    }
  }, [title, content, selectedMood, tags, isFavorite, selectedFolderId, wordCount, readingTime, aiProfessionalFeedback, aiHumorousFeedback, post?.id, createPost, updatePost, onSave, generateAIFeedback])

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const insertFormatting = (format: string) => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    let replacement = ''
    switch (format) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`
        break
      case 'heading':
        replacement = `# ${selectedText || 'Heading'}`
        break
      case 'list':
        replacement = `- ${selectedText || 'List item'}`
        break
      case 'quote':
        replacement = `> ${selectedText || 'Quote'}`
        break
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + replacement.length, start + replacement.length)
    }, 0)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Writing Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-sm text-muted-foreground">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button onClick={() => handleSave(false)} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button 
                onClick={generateAIFeedback} 
                disabled={isGeneratingFeedback || content.trim().length < 50}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isGeneratingFeedback ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Get AI Feedback
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Title Input */}
          <Input
            placeholder="Give your entry a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-semibold border-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground"
          />

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-2 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
            <Button variant="ghost" size="sm" onClick={() => insertFormatting('bold')}>
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => insertFormatting('italic')}>
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => insertFormatting('heading')}>
              <Hash className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => insertFormatting('list')}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => insertFormatting('quote')}>
              <Quote className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? 'text-red-500' : ''}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Content Editor */}
          <Textarea
            ref={contentRef}
            placeholder="Start writing your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] text-base leading-relaxed resize-none border-none focus-visible:ring-0 p-0"
          />

          {/* Folder, Mood and Tags */}
          <div className="space-y-4">
            {/* Folder Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Save to Folder
              </label>
              <Select value={selectedFolderId || 'none'} onValueChange={(value) => setSelectedFolderId(value === 'none' ? null : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder (General)</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        {folder.isPasswordProtected && <span className="text-xs">🔒</span>}
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mood Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(mood => (
                  <Button
                    key={mood}
                    variant={selectedMood === mood ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMood(selectedMood === mood ? '' : mood)}
                    className="text-lg"
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1"
                />
                <Button onClick={addTag} variant="outline" size="sm">
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Writing Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Writing Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Words</span>
                <span className="font-medium">{wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reading time</span>
                <span className="font-medium">{readingTime} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Writing time</span>
                <span className="font-medium">
                  {Math.floor((Date.now() - writingStartTime.getTime()) / 60000)} min
                </span>
              </div>
            </CardContent>
          </Card>

          {/* AI Feedback */}
          {(aiProfessionalFeedback || aiHumorousFeedback || isGeneratingFeedback) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={feedbackMode} onValueChange={(value) => setFeedbackMode(value as AIFeedbackMode)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="professional" className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Professional
                    </TabsTrigger>
                    <TabsTrigger value="humorous" className="flex items-center gap-2">
                      <Smile className="w-4 h-4" />
                      Humorous
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="professional" className="mt-4">
                    {isGeneratingFeedback ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="w-4 h-4 animate-pulse" />
                        Generating professional feedback...
                      </div>
                    ) : aiProfessionalFeedback ? (
                      <p className="text-sm leading-relaxed">{aiProfessionalFeedback}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Save your post to get professional counseling feedback.
                      </p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="humorous" className="mt-4">
                    {isGeneratingFeedback ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="w-4 h-4 animate-pulse" />
                        Generating humorous feedback...
                      </div>
                    ) : aiHumorousFeedback ? (
                      <p className="text-sm leading-relaxed">{aiHumorousFeedback}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Save your post to get some witty (but caring) feedback.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>

                {!isGeneratingFeedback && content.trim().length > 50 && (
                  <Button
                    onClick={generateAIFeedback}
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Regenerate Feedback
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}