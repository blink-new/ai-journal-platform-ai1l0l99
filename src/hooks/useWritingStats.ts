import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { usePosts } from './usePosts'
import type { WritingStats } from '../types'

export const useWritingStats = () => {
  const { user } = useAuth()
  const { posts } = usePosts()
  const [stats, setStats] = useState<WritingStats>({
    totalPosts: 0,
    totalWords: 0,
    totalTime: 0,
    averageWordsPerPost: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteCount: 0,
    todayWords: 0,
    weekWords: 0,
    monthWords: 0
  })

  const calculateStats = useCallback(() => {
    if (!posts.length) {
      setStats({
        totalPosts: 0,
        totalWords: 0,
        totalTime: 0,
        averageWordsPerPost: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteCount: 0,
        todayWords: 0,
        weekWords: 0,
        monthWords: 0
      })
      return
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Basic stats
    const totalPosts = posts.length
    const totalWords = posts.reduce((sum, post) => sum + post.wordCount, 0)
    const totalTime = posts.reduce((sum, post) => sum + (post.readingTime * 60), 0) // Convert to seconds
    const averageWordsPerPost = totalPosts > 0 ? Math.round(totalWords / totalPosts) : 0
    const favoriteCount = posts.filter(post => post.isFavorite).length

    // Time-based stats
    const todayWords = posts
      .filter(post => new Date(post.createdAt) >= today)
      .reduce((sum, post) => sum + post.wordCount, 0)

    const weekWords = posts
      .filter(post => new Date(post.createdAt) >= weekAgo)
      .reduce((sum, post) => sum + post.wordCount, 0)

    const monthWords = posts
      .filter(post => new Date(post.createdAt) >= monthAgo)
      .reduce((sum, post) => sum + post.wordCount, 0)

    // Calculate streaks
    const sortedPosts = [...posts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null

    for (const post of sortedPosts) {
      const postDate = new Date(post.createdAt)
      const postDay = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate())

      if (!lastDate) {
        // First post
        if (postDay.getTime() === today.getTime() || 
            postDay.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
          currentStreak = 1
          tempStreak = 1
        }
        lastDate = postDay
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - postDay.getTime()) / (24 * 60 * 60 * 1000))
        
        if (daysDiff === 1) {
          // Consecutive day
          tempStreak++
          if (currentStreak === 0 && postDay.getTime() <= today.getTime()) {
            currentStreak = tempStreak
          }
        } else if (daysDiff === 0) {
          // Same day, don't break streak
          continue
        } else {
          // Streak broken
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
          currentStreak = 0
        }
        lastDate = postDay
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    setStats({
      totalPosts,
      totalWords,
      totalTime,
      averageWordsPerPost,
      currentStreak,
      longestStreak,
      favoriteCount,
      todayWords,
      weekWords,
      monthWords
    })
  }, [posts])

  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  return {
    stats,
    refreshStats: calculateStats
  }
}