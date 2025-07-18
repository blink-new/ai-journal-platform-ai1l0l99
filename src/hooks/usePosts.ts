import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
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
      
      const result = await blink.db.posts.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      // Transform database results to match Post interface
      const transformedPosts: Post[] = result.map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags || [],
        mood: post.mood,
        isFavorite: Number(post.isFavorite) > 0, // Convert SQLite boolean
        wordCount: post.wordCount || 0,
        readingTime: post.readingTime || 0,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        userId: post.userId
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

      const newPost = await blink.db.posts.create({
        title: postData.title,
        content: postData.content,
        tags: postData.tags,
        mood: postData.mood,
        isFavorite: postData.isFavorite,
        wordCount,
        readingTime,
        userId: user.id
      })

      await fetchPosts() // Refresh the list
      return newPost
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

      await blink.db.posts.update(id, {
        ...updates,
        ...(wordCount && { wordCount }),
        ...(readingTime && { readingTime })
      })

      await fetchPosts() // Refresh the list
    } catch (err) {
      console.error('Error updating post:', err)
      throw err
    }
  }

  const deletePost = async (id: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      await blink.db.posts.delete(id)
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