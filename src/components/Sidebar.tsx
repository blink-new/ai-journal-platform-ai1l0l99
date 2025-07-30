import { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Home, FolderLock, Plus, Settings, LogOut, Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usePosts } from '../hooks/usePosts'
import type { Post } from '../types'

interface SidebarProps {
  currentView: 'dashboard' | 'writing' | 'folders'
  onViewChange: (view: 'dashboard' | 'writing' | 'folders') => void
  onCreatePost: () => void
  onEditPost: (post: Post) => void
  onOpenSettings: () => void
}

export const Sidebar = ({ currentView, onViewChange, onCreatePost, onEditPost, onOpenSettings }: SidebarProps) => {
  const { user, logout } = useAuth()
  const { posts, deletePost } = usePosts()
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this post?')) {
      setDeletingPostId(postId)
      try {
        await deletePost(postId)
      } catch (error) {
        console.error('Failed to delete post:', error)
      } finally {
        setDeletingPostId(null)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="w-80 bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Journal AI
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Writer'}
          </p>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-2 mb-8">
          <Button
            variant={currentView === 'dashboard' ? 'default' : 'ghost'}
            className={`w-full justify-start h-12 text-left font-medium transition-all duration-200 ${
              currentView === 'dashboard' 
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md' 
                : 'hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
            onClick={() => onViewChange('dashboard')}
          >
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Button>

          <Button
            variant={currentView === 'folders' ? 'default' : 'ghost'}
            className={`w-full justify-start h-12 text-left font-medium transition-all duration-200 ${
              currentView === 'folders' 
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md' 
                : 'hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
            onClick={() => onViewChange('folders')}
          >
            <FolderLock className="w-5 h-5 mr-3" />
            Secure Folders
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start h-12 text-left font-medium transition-all duration-200 hover:bg-amber-100 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-2 border-dashed border-amber-300 dark:border-amber-600"
            onClick={onCreatePost}
          >
            <Plus className="w-5 h-5 mr-3" />
            New Post
          </Button>
        </div>

        {/* Posts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
              Recent Posts
            </h3>
            <Badge variant="secondary" className="text-xs">
              {posts.length}
            </Badge>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                No posts yet
              </p>
              <Button
                onClick={onCreatePost}
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.slice(0, 10).map(post => (
                <div
                  key={post.id}
                  className="group p-4 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-white dark:hover:bg-stone-800 cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => onEditPost(post)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-stone-900 dark:text-stone-100 line-clamp-1 flex-1 mr-2">
                      {post.title}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={(e) => handleDeletePost(post.id, e)}
                      disabled={deletingPostId === post.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span>{formatDate(post.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      {post.mood && <span className="text-sm">{post.mood}</span>}
                      <span>{post.wordCount} words</span>
                    </div>
                  </div>
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-left font-medium hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
            onClick={onOpenSettings}
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-left font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}