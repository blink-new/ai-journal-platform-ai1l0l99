import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { WritingInterface } from './components/WritingInterface'
import { useAuth } from './hooks/useAuth'
import type { Post } from './types'

type View = 'dashboard' | 'writing' | 'folders'

function App() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [currentPost, setCurrentPost] = useState<Post | undefined>()
  const [darkMode, setDarkMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Initialize dark mode from system preference
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(isDark)
  }, [])

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleCreatePost = () => {
    setCurrentPost(undefined)
    setCurrentView('writing')
  }

  const handleEditPost = (post: Post) => {
    setCurrentPost(post)
    setCurrentView('writing')
  }

  const handleSavePost = (postData: Partial<Post>) => {
    // Post is already saved by WritingInterface, just navigate back
    setCurrentView('dashboard')
  }

  const handleBackToDashboard = () => {
    setCurrentPost(undefined)
    setCurrentView('dashboard')
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const openSettings = () => {
    setShowSettings(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <div className="w-4 h-4 bg-white rounded-sm animate-pulse"></div>
          </div>
          <p className="text-stone-600 dark:text-stone-400">Loading Journal AI...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            Welcome to Journal AI
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
            Your personal AI-powered journaling companion. Get professional counseling insights and humorous feedback on your thoughts and experiences.
          </p>
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 shadow-lg border border-stone-200 dark:border-stone-700">
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              Please sign in to start your journaling journey
            </p>
            <div className="animate-pulse flex items-center justify-center">
              <div className="w-4 h-4 bg-amber-400 rounded-full mr-2"></div>
              <span className="text-stone-600 dark:text-stone-300">Redirecting to sign in...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenSettings={openSettings}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <main className="min-h-[calc(100vh-4rem)]">
        {currentView === 'dashboard' && (
          <Dashboard
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
          />
        )}
        
        {currentView === 'writing' && (
          <WritingInterface
            post={currentPost}
            onSave={handleSavePost}
            onBack={handleBackToDashboard}
          />
        )}
        
        {currentView === 'folders' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">
                Secure Folders
              </h2>
              <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
                Organize your journal entries into password-protected folders. Coming soon!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App