import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { MainContent } from './components/MainContent'
import { SecureFolders } from './components/SecureFolders'
import { WritingInterface } from './components/WritingInterface'
import { SettingsModal } from './components/SettingsModal'
import { AuthForm } from './components/AuthForm'
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
    return <AuthForm />
  }

  return (
    <div className={`min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onCreatePost={handleCreatePost}
          onEditPost={handleEditPost}
          onOpenSettings={openSettings}
        />
        
        {/* Main Content */}
        {currentView === 'dashboard' && (
          <MainContent
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
          />
        )}
        
        {currentView === 'writing' && (
          <div className="flex-1 bg-white dark:bg-stone-950 overflow-y-auto">
            <WritingInterface
              post={currentPost}
              onSave={handleSavePost}
              onBack={handleBackToDashboard}
            />
          </div>
        )}
        
        {currentView === 'folders' && (
          <SecureFolders onEditPost={handleEditPost} />
        )}
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    </div>
  )
}

export default App