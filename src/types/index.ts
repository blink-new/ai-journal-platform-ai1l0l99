export interface User {
  id: string
  email: string
  displayName?: string
}

export interface Folder {
  id: string
  userId: string
  name: string
  isPasswordProtected: boolean
  passwordHash?: string
  createdAt: string
  updatedAt: string
  postCount?: number
}

export interface Post {
  id: string
  userId: string
  folderId?: string
  title: string
  content: string
  mood?: string
  tags: string[]
  isFavorite: boolean
  wordCount: number
  readingTime: number
  createdAt: string
  updatedAt: string
  aiProfessionalFeedback?: string
  aiHumorousFeedback?: string
  feedbackGeneratedAt?: string
}

export interface WritingGoal {
  id: string
  userId: string
  type: 'daily' | 'weekly' | 'monthly'
  targetWords: number
  currentWords: number
  targetDate: string
  createdAt: string
}

export interface WritingSession {
  id: string
  userId: string
  postId?: string
  startTime: string
  endTime?: string
  wordsWritten: number
  duration: number
}

export type AIFeedbackMode = 'professional' | 'humorous'

export interface WritingStats {
  totalPosts: number
  totalWords: number
  totalTime: number
  averageWordsPerPost: number
  currentStreak: number
  longestStreak: number
  favoriteCount: number
  todayWords: number
  weekWords: number
  monthWords: number
}