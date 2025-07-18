import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { usePosts } from './usePosts'

interface WritingStats {
  totalPosts: number
  totalWords: number
  averageWordsPerPost: number
  todayWords: number
  currentStreak: number
  longestStreak: number
  favoriteCount: number
}

export const useWritingStats = () => {
  const [stats, setStats] = useState<WritingStats>({
    totalPosts: 0,
    totalWords: 0,
    averageWordsPerPost: 0,
    todayWords: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteCount: 0
  })
  const { user } = useAuth()
  const { posts } = usePosts()

  const calculateStats = useCallback(() => {
    if (!user || posts.length === 0) {
      setStats({
        totalPosts: 0,
        totalWords: 0,
        averageWordsPerPost: 0,
        todayWords: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteCount: 0
      })
      return
    }

    const totalPosts = posts.length
    const totalWords = posts.reduce((sum, post) => sum + post.wordCount, 0)
    const averageWordsPerPost = totalPosts > 0 ? Math.round(totalWords / totalPosts) : 0
    const favoriteCount = posts.filter(post => post.isFavorite).length

    // Calculate today's words
    const today = new Date().toDateString()
    const todayWords = posts
      .filter(post => new Date(post.createdAt).toDateString() === today)
      .reduce((sum, post) => sum + post.wordCount, 0)

    // Calculate streaks (simplified - consecutive days with posts)
    const postDates = posts
      .map(post => new Date(post.createdAt).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index) // unique dates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // newest first

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    if (postDates.length > 0) {
      const todayStr = new Date().toDateString()
      const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
      
      // Check if streak is current (posted today or yesterday)
      if (postDates[0] === todayStr || postDates[0] === yesterdayStr) {
        currentStreak = 1
        tempStreak = 1
        
        // Count consecutive days
        for (let i = 1; i < postDates.length; i++) {
          const currentDate = new Date(postDates[i-1])
          const nextDate = new Date(postDates[i])
          const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (24 * 60 * 60 * 1000))
          
          if (dayDiff === 1) {
            currentStreak++
            tempStreak++
          } else {
            break
          }
        }
      }
      
      // Calculate longest streak
      tempStreak = 1
      for (let i = 1; i < postDates.length; i++) {
        const currentDate = new Date(postDates[i-1])
        const nextDate = new Date(postDates[i])
        const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (24 * 60 * 60 * 1000))
        
        if (dayDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    setStats({
      totalPosts,
      totalWords,
      averageWordsPerPost,
      todayWords,
      currentStreak,
      longestStreak,
      favoriteCount
    })
  }, [user, posts])

  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  return { stats }
}