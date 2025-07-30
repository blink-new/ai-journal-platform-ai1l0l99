import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { FolderLock, Plus, Lock, Unlock, Eye, EyeOff, Trash2, Edit } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Post } from '../types'

interface Folder {
  id: string
  name: string
  description?: string
  isPasswordProtected: boolean
  postCount: number
  createdAt: string
  updatedAt: string
}

interface SecureFoldersProps {
  onEditPost: (post: Post) => void
}

export const SecureFolders = ({ onEditPost }: SecureFoldersProps) => {
  const { user } = useAuth()
  const [folders, setFolders] = useState<Folder[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [unlockedFolders, setUnlockedFolders] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingFolder, setPendingFolder] = useState<Folder | null>(null)
  
  // Form states
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDescription, setNewFolderDescription] = useState('')
  const [newFolderPassword, setNewFolderPassword] = useState('')
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true)
      
      // First, create the folders table if it doesn't exist
      await supabase.rpc('create_folders_table_if_not_exists')
      
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (foldersError && foldersError.code !== 'PGRST116') { // PGRST116 = table doesn't exist
        throw foldersError
      }

      // Transform folders data
      const transformedFolders: Folder[] = (foldersData || []).map((folder: any) => ({
        id: folder.id,
        name: folder.name,
        description: folder.description,
        isPasswordProtected: folder.is_password_protected || false,
        postCount: folder.post_count || 0,
        createdAt: folder.created_at,
        updatedAt: folder.updated_at
      }))

      setFolders(transformedFolders)
    } catch (error) {
      console.error('Error fetching folders:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      fetchFolders()
    }
  }, [user, fetchFolders])

  const fetchFolderPosts = async (folderId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform posts data
      const transformedPosts: Post[] = (data || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags || [],
        mood: post.mood,
        isFavorite: post.is_favorite || false,
        wordCount: post.word_count || 0,
        readingTime: post.reading_time || 0,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        userId: post.user_id,
        folderId: post.folder_id,
        aiProfessionalFeedback: post.ai_professional_feedback,
        aiHumorousFeedback: post.ai_humorous_feedback,
        feedbackGeneratedAt: post.feedback_generated_at
      }))

      setPosts(transformedPosts)
    } catch (error) {
      console.error('Error fetching folder posts:', error)
    }
  }

  const createFolder = async () => {
    console.log('createFolder called', { newFolderName, isPasswordProtected, newFolderPassword })
    
    if (!newFolderName.trim()) {
      console.log('No folder name provided')
      return
    }

    if (isPasswordProtected && !newFolderPassword.trim()) {
      console.log('Password protection enabled but no password provided')
      return
    }

    try {
      const folderData = {
        name: newFolderName.trim(),
        description: newFolderDescription.trim() || null,
        is_password_protected: isPasswordProtected,
        password_hash: isPasswordProtected ? btoa(newFolderPassword) : null, // Simple base64 encoding for demo
        user_id: user?.id
      }

      console.log('Inserting folder data:', folderData)

      const { data, error } = await supabase
        .from('folders')
        .insert(folderData)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Folder created successfully:', data)

      // Reset form
      setNewFolderName('')
      setNewFolderDescription('')
      setNewFolderPassword('')
      setIsPasswordProtected(false)
      setShowCreateDialog(false)

      // Refresh folders
      await fetchFolders()
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Failed to create folder: ' + error.message)
    }
  }

  const verifyFolderPassword = async (folder: Folder, password: string) => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('password_hash')
        .eq('id', folder.id)
        .eq('user_id', user?.id)
        .single()

      if (error) throw error

      // Simple base64 comparison for demo (in production, use proper hashing)
      const isValid = data.password_hash === btoa(password)
      
      if (isValid) {
        setUnlockedFolders(prev => new Set([...prev, folder.id]))
        setSelectedFolder(folder)
        await fetchFolderPosts(folder.id)
        setShowPasswordDialog(false)
        setPasswordInput('')
        setPendingFolder(null)
      } else {
        alert('Incorrect password')
      }
    } catch (error) {
      console.error('Error verifying password:', error)
    }
  }

  const handleFolderClick = async (folder: Folder) => {
    if (folder.isPasswordProtected && !unlockedFolders.has(folder.id)) {
      setPendingFolder(folder)
      setShowPasswordDialog(true)
    } else {
      setSelectedFolder(folder)
      await fetchFolderPosts(folder.id)
    }
  }

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? All posts in this folder will be moved to your main journal.')) {
      return
    }

    try {
      // First, move all posts in this folder back to main journal
      await supabase
        .from('posts')
        .update({ folder_id: null })
        .eq('folder_id', folderId)
        .eq('user_id', user?.id)

      // Then delete the folder
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)
        .eq('user_id', user?.id)

      if (error) throw error

      // Refresh folders
      await fetchFolders()
      
      // If this was the selected folder, clear selection
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(null)
        setPosts([])
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FolderLock className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <p className="text-muted-foreground">Loading secure folders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white dark:bg-stone-950">
      <div className="p-8 ml-8 mr-8">
        {!selectedFolder ? (
          // Folders Overview
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                  Secure Folders
                </h1>
                <p className="text-stone-600 dark:text-stone-400">
                  Organize your journal entries in password-protected folders
                </p>
              </div>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Secure Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="folder-name">Folder Name</Label>
                      <Input
                        id="folder-name"
                        placeholder="e.g., Personal Thoughts, Work Reflections"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="folder-description">Description (Optional)</Label>
                      <Input
                        id="folder-description"
                        placeholder="Brief description of this folder's purpose"
                        value={newFolderDescription}
                        onChange={(e) => setNewFolderDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="password-protected"
                        checked={isPasswordProtected}
                        onChange={(e) => setIsPasswordProtected(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="password-protected">Password protect this folder</Label>
                    </div>
                    {isPasswordProtected && (
                      <div>
                        <Label htmlFor="folder-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="folder-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter a secure password"
                            value={newFolderPassword}
                            onChange={(e) => setNewFolderPassword(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={createFolder} 
                        disabled={!newFolderName.trim() || (isPasswordProtected && !newFolderPassword.trim())}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        Create Folder
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {folders.length === 0 ? (
              <div className="text-center py-16 bg-stone-50 dark:bg-stone-900 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700">
                <FolderLock className="mx-auto h-16 w-16 text-stone-400 mb-6" />
                <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">
                  No Secure Folders Yet
                </h3>
                <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
                  Create password-protected folders to organize your most private thoughts and reflections.
                </p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Folder
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map(folder => (
                  <Card 
                    key={folder.id}
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-600"
                    onClick={() => handleFolderClick(folder)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {folder.isPasswordProtected ? (
                              unlockedFolders.has(folder.id) ? (
                                <Unlock className="w-5 h-5 text-green-500" />
                              ) : (
                                <Lock className="w-5 h-5 text-amber-500" />
                              )
                            ) : (
                              <FolderLock className="w-5 h-5 text-stone-400" />
                            )}
                            <CardTitle className="text-lg group-hover:text-amber-600 transition-colors">
                              {folder.name}
                            </CardTitle>
                          </div>
                          {folder.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {folder.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {folder.postCount} posts
                            </Badge>
                            <span>
                              {new Date(folder.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteFolder(folder.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          // Folder Contents
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setSelectedFolder(null)}>
                  ← Back to Folders
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    {selectedFolder.isPasswordProtected ? (
                      <Unlock className="w-8 h-8 text-green-500" />
                    ) : (
                      <FolderLock className="w-8 h-8 text-stone-400" />
                    )}
                    {selectedFolder.name}
                  </h1>
                  {selectedFolder.description && (
                    <p className="text-stone-600 dark:text-stone-400 mt-1">
                      {selectedFolder.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-16 bg-stone-50 dark:bg-stone-900 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700">
                <FolderLock className="mx-auto h-16 w-16 text-stone-400 mb-6" />
                <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">
                  This folder is empty
                </h3>
                <p className="text-stone-500 dark:text-stone-400 mb-6">
                  Create posts and assign them to this folder to keep them organized and secure.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                  <Card 
                    key={post.id}
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-600"
                    onClick={() => onEditPost(post)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {post.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {post.mood && <span className="text-lg">{post.mood}</span>}
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                Enter Password for "{pendingFolder?.name}"
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password-input">Password</Label>
                <Input
                  id="password-input"
                  type="password"
                  placeholder="Enter folder password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && pendingFolder) {
                      verifyFolderPassword(pendingFolder, passwordInput)
                    }
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setShowPasswordDialog(false)
                  setPasswordInput('')
                  setPendingFolder(null)
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => pendingFolder && verifyFolderPassword(pendingFolder, passwordInput)}
                  disabled={!passwordInput.trim()}
                >
                  Unlock
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}