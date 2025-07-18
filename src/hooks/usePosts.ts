import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../blink/client'
import { useAuth } from './useAuth'
import type { Post } from '../types'

export const usePosts = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    if (!user) {
      setPosts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      // Transform database fields to match our types
      const transformedPosts: Post[] = (data || []).map((post: any) => ({
        id: post.id,
        userId: post.user_id,
        folderId: post.folder_id,
        title: post.title,
        content: post.content,
        mood: post.mood,
        tags: post.tags || [],
        isFavorite: post.is_favorite || false,
        wordCount: post.word_count || 0,
        readingTime: post.reading_time || 0,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        aiProfessionalFeedback: post.ai_professional_feedback,
        aiHumorousFeedback: post.ai_humorous_feedback,
        feedbackGeneratedAt: post.feedback_generated_at
      }))

      setPosts(transformedPosts)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [user])

  const createPost = async (postData: Partial<Post>): Promise<Post | null> => {
    if (!user) return null

    try {
      const newPost = {
        user_id: user.id,
        title: postData.title || 'Untitled',
        content: postData.content || '',
        mood: postData.mood || '',
        tags: postData.tags || [],
        is_favorite: postData.isFavorite || false,
        word_count: postData.wordCount || 0,
        reading_time: postData.readingTime || 0,
        ai_professional_feedback: postData.aiProfessionalFeedback || '',
        ai_humorous_feedback: postData.aiHumorousFeedback || '',
        folder_id: postData.folderId || null
      }

      const { data, error: supabaseError } = await supabase
        .from('posts')
        .insert([newPost])
        .select()
        .single()

      if (supabaseError) {
        throw supabaseError
      }
      
      const transformedPost: Post = {
        id: data.id,
        userId: data.user_id,
        folderId: data.folder_id,
        title: data.title,
        content: data.content,
        mood: data.mood,
        tags: data.tags || [],
        isFavorite: data.is_favorite || false,
        wordCount: data.word_count || 0,
        readingTime: data.reading_time || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        aiProfessionalFeedback: data.ai_professional_feedback,
        aiHumorousFeedback: data.ai_humorous_feedback,
        feedbackGeneratedAt: data.feedback_generated_at
      }

      setPosts(prev => [transformedPost, ...prev])
      return transformedPost
    } catch (err) {
      console.error('Error creating post:', err)
      setError('Failed to create post')
      return null
    }
  }

  const updatePost = async (postId: string, updates: Partial<Post>): Promise<Post | null> => {
    if (!user) return null

    try {
      const updateData: any = {}
      
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.content !== undefined) updateData.content = updates.content
      if (updates.mood !== undefined) updateData.mood = updates.mood
      if (updates.tags !== undefined) updateData.tags = updates.tags
      if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite
      if (updates.wordCount !== undefined) updateData.word_count = updates.wordCount
      if (updates.readingTime !== undefined) updateData.reading_time = updates.readingTime
      if (updates.aiProfessionalFeedback !== undefined) updateData.ai_professional_feedback = updates.aiProfessionalFeedback
      if (updates.aiHumorousFeedback !== undefined) updateData.ai_humorous_feedback = updates.aiHumorousFeedback
      if (updates.folderId !== undefined) updateData.folder_id = updates.folderId
      
      if (updates.aiProfessionalFeedback || updates.aiHumorousFeedback) {
        updateData.feedback_generated_at = new Date().toISOString()
      }

      updateData.updated_at = new Date().toISOString()

      const { data, error: supabaseError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (supabaseError) {
        throw supabaseError
      }
      
      const transformedPost: Post = {
        id: data.id,
        userId: data.user_id,
        folderId: data.folder_id,
        title: data.title,
        content: data.content,
        mood: data.mood,
        tags: data.tags || [],
        isFavorite: data.is_favorite || false,
        wordCount: data.word_count || 0,
        readingTime: data.reading_time || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        aiProfessionalFeedback: data.ai_professional_feedback,
        aiHumorousFeedback: data.ai_humorous_feedback,
        feedbackGeneratedAt: data.feedback_generated_at
      }

      setPosts(prev => prev.map(post => post.id === postId ? transformedPost : post))
      return transformedPost
    } catch (err) {
      console.error('Error updating post:', err)
      setError('Failed to update post')
      return null
    }
  }

  const deletePost = async (postId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error: supabaseError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id)

      if (supabaseError) {
        throw supabaseError
      }

      setPosts(prev => prev.filter(post => post.id !== postId))
      return true
    } catch (err) {
      console.error('Error deleting post:', err)
      setError('Failed to delete post')
      return false
    }
  }

  const toggleFavorite = async (postId: string): Promise<boolean> => {
    const post = posts.find(p => p.id === postId)
    if (!post) return false

    const updated = await updatePost(postId, { isFavorite: !post.isFavorite })
    return updated !== null
  }

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

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