import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Heart, Search, Plus, BookOpen, Target, TrendingUp, Filter, Loader2, MoreVertical, Folder } from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { useWritingStats } from '../hooks/useWritingStats'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import type { Post, Folder } from '../types'

interface DashboardProps {
  onCreatePost: () => void
  onEditPost: (post: Post) => void
}

export const Dashboard = ({ onCreatePost, onEditPost }: DashboardProps) => {
  const { posts, loading, error, toggleFavorite, updatePost } = usePosts()
  const { stats } = useWritingStats()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !selectedTag || post.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)))

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

  const handleToggleFavorite = async (postId: string) => {
    await toggleFavorite(postId)
  }

  const handleMoveToFolder = async (postId: string, folderId: string | null) => {
    try {
      await updatePost(postId, { folderId })
    } catch (error) {
      console.error('Error moving post to folder:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="ml-2 text-muted-foreground">Loading your journal...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Error loading posts: {error}</div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Compact Stats Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.totalPosts}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Posts</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.totalWords.toLocaleString()}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Words Written</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.currentStreak}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.favoriteCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Favorites</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreatePost} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedTag === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag(null)}
          >
            <Filter className="w-3 h-3 mr-1" />
            All
          </Button>
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {posts.length === 0 ? 'No posts yet' : 'No posts match your search'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {posts.length === 0 
              ? 'Start your journaling journey by creating your first post.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {posts.length === 0 && (
            <Button onClick={onCreatePost} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <Card key={post.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => onEditPost(post)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {post.mood && <span className="text-lg">{post.mood}</span>}
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      {post.folderId && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Folder className="w-3 h-3" />
                          {folders.find(f => f.id === post.folderId)?.name || 'Unknown'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorite(post.id)
                      }}
                    >
                      <Heart className={`w-4 h-4 ${post.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoveToFolder(post.id, null)
                          }}
                        >
                          <Folder className="w-4 h-4 mr-2" />
                          No folder (General)
                        </DropdownMenuItem>
                        {folders.map(folder => (
                          <DropdownMenuItem
                            key={folder.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMoveToFolder(post.id, folder.id)
                            }}
                          >
                            <Folder className="w-4 h-4 mr-2" />
                            {folder.isPasswordProtected && '🔒 '}
                            {folder.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {post.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{post.wordCount} words</span>
                    <span>•</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}