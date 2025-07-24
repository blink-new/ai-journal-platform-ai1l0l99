import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Post } from '../types'

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchPosts = useCallback(async () => {
    if (!user) {
      setPosts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      // Transform database results to match Post interface
      const transformedPosts: Post[] = (data || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags || [],
        mood: post.mood,
        isFavorite: post.is_favorite || false,
        folderId: post.folder_id,
        wordCount: post.word_count || 0,
        readingTime: post.reading_time || 0,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        userId: post.user_id
      }))
      
      setPosts(transformedPosts)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const wordCount = postData.content.split(/\s+/).filter(word => word.length > 0).length
      const readingTime = Math.max(1, Math.ceil(wordCount / 200)) // 200 words per minute

      const { data, error: createError } = await supabase
        .from('posts')
        .insert({
          title: postData.title,
          content: postData.content,
          tags: postData.tags,
          mood: postData.mood,
          is_favorite: postData.isFavorite,
          folder_id: postData.folderId,
          word_count: wordCount,
          reading_time: readingTime,
          user_id: user.id
        })
        .select()
        .single()

      if (createError) throw createError

      // Transform the database result to match Post interface
      const transformedPost: Post = {
        id: data.id,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        mood: data.mood,
        isFavorite: data.is_favorite || false,
        folderId: data.folder_id,
        wordCount: data.word_count || 0,
        readingTime: data.reading_time || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id,
        aiProfessionalFeedback: data.ai_professional_feedback,
        aiHumorousFeedback: data.ai_humorous_feedback,
        feedbackGeneratedAt: data.feedback_generated_at
      }

      await fetchPosts() // Refresh the list
      return transformedPost
    } catch (err) {
      console.error('Error creating post:', err)
      throw err
    }
  }

  const updatePost = async (id: string, updates: Partial<Post>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const wordCount = updates.content ? 
        updates.content.split(/\s+/).filter(word => word.length > 0).length : 
        undefined
      const readingTime = wordCount ? Math.max(1, Math.ceil(wordCount / 200)) : undefined

      const updateData: any = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.content !== undefined) updateData.content = updates.content
      if (updates.tags !== undefined) updateData.tags = updates.tags
      if (updates.mood !== undefined) updateData.mood = updates.mood
      if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite
      if (updates.folderId !== undefined) updateData.folder_id = updates.folderId
      if (updates.aiProfessionalFeedback !== undefined) updateData.ai_professional_feedback = updates.aiProfessionalFeedback
      if (updates.aiHumorousFeedback !== undefined) updateData.ai_humorous_feedback = updates.aiHumorousFeedback
      if (wordCount !== undefined) updateData.word_count = wordCount
      if (readingTime !== undefined) updateData.reading_time = readingTime

      const { data, error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Transform the database result to match Post interface
      const transformedPost: Post = {
        id: data.id,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        mood: data.mood,
        isFavorite: data.is_favorite || false,
        folderId: data.folder_id,
        wordCount: data.word_count || 0,
        readingTime: data.reading_time || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id,
        aiProfessionalFeedback: data.ai_professional_feedback,
        aiHumorousFeedback: data.ai_humorous_feedback,
        feedbackGeneratedAt: data.feedback_generated_at
      }

      await fetchPosts() // Refresh the list
      return transformedPost
    } catch (err) {
      console.error('Error updating post:', err)
      throw err
    }
  }

  const deletePost = async (id: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      await fetchPosts() // Refresh the list
    } catch (err) {
      console.error('Error deleting post:', err)
      throw err
    }
  }

  const toggleFavorite = async (id: string) => {
    const post = posts.find(p => p.id === id)
    if (!post) return

    try {
      await updatePost(id, { isFavorite: !post.isFavorite })
    } catch (err) {
      console.error('Error toggling favorite:', err)
      throw err
    }
  }

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    toggleFavorite,
    refetch: fetchPosts
  }
}