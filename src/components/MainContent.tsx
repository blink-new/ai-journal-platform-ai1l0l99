import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Heart, Search, Plus, BookOpen, Target, TrendingUp, Filter, Loader2, Trash2 } from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { useWritingStats } from '../hooks/useWritingStats'
import type { Post } from '../types'

interface MainContentProps {
  onCreatePost: () => void
  onEditPost: (post: Post) => void
}

export const MainContent = ({ onCreatePost, onEditPost }: MainContentProps) => {
  const { posts, loading, error, toggleFavorite, deletePost } = usePosts()
  const { stats } = useWritingStats()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !selectedTag || post.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)))

  const handleToggleFavorite = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleFavorite(postId)
  }

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

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="ml-2 text-muted-foreground">Loading your journal...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
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
    <div className="flex-1 bg-white dark:bg-stone-950">
      {/* Content Area with Padding and Separation */}
      <div className="p-8 ml-8 mr-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-stone-200 dark:border-stone-800 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.averageWordsPerPost} avg words/post
              </p>
            </CardContent>
          </Card>

          <Card className="border-stone-200 dark:border-stone-800 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Words Written</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.todayWords} today
              </p>
            </CardContent>
          </Card>

          <Card className="border-stone-200 dark:border-stone-800 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <p className="text-xs text-muted-foreground">
                {stats.longestStreak} longest streak
              </p>
            </CardContent>
          </Card>

          <Card className="border-stone-200 dark:border-stone-800 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoriteCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPosts > 0 ? Math.round((stats.favoriteCount / stats.totalPosts) * 100) : 0}% of posts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-stone-300 dark:border-stone-700"
            />
          </div>
          <Button 
            onClick={onCreatePost} 
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
              className={selectedTag === null ? "bg-amber-500 hover:bg-amber-600" : ""}
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
                className={selectedTag === tag ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                {tag}
              </Button>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 dark:bg-stone-900 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700">
            <BookOpen className="mx-auto h-16 w-16 text-stone-400 mb-6" />
            <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">
              {posts.length === 0 ? 'Start Your Journey' : 'No posts match your search'}
            </h3>
            <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
              {posts.length === 0 
                ? 'Create your first journal entry and begin exploring your thoughts with AI-powered insights.'
                : 'Try adjusting your search or filter criteria to find what you\'re looking for.'
              }
            </p>
            {posts.length === 0 && (
              <Button 
                onClick={onCreatePost} 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Card 
                key={post.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-600 bg-white dark:bg-stone-900" 
                onClick={() => onEditPost(post)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-amber-600 transition-colors mb-2">
                        {post.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {post.mood && <span className="text-lg">{post.mood}</span>}
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleToggleFavorite(post.id, e)}
                        className="p-1 h-auto"
                      >
                        <Heart className={`w-4 h-4 ${post.isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeletePost(post.id, e)}
                        disabled={deletingPostId === post.id}
                        className="p-1 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
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
    </div>
  )
}