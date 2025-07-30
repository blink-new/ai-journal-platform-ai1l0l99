import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Switch } from './ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Settings, User, Bell, Palette, Download, Trash2, Moon, Sun } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

export const SettingsModal = ({ isOpen, onClose, darkMode, onToggleDarkMode }: SettingsModalProps) => {
  const { user, logout } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [dailyReminders, setDailyReminders] = useState(false)
  const [autoSaveInterval, setAutoSaveInterval] = useState('3')
  const [fontSize, setFontSize] = useState('16')
  const [dailyWordGoal, setDailyWordGoal] = useState('500')

  const handleSaveProfile = () => {
    // TODO: Implement profile update
    console.log('Saving profile:', { displayName })
  }

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Exporting data...')
  }

  const handleDeleteAllPosts = () => {
    if (confirm('Are you sure you want to delete ALL your posts? This action cannot be undone.')) {
      // TODO: Implement bulk delete
      console.log('Deleting all posts...')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-stone-50 dark:bg-stone-800"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
                <Button onClick={handleSaveProfile} className="w-full">
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance & Writing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                    <Switch
                      checked={darkMode}
                      onCheckedChange={onToggleDarkMode}
                      className="data-[state=checked]:bg-amber-500"
                    />
                    <Moon className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fontSize">Font Size (px)</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    min="12"
                    max="24"
                  />
                </div>

                <div>
                  <Label htmlFor="autoSave">Auto-save Interval (seconds)</Label>
                  <Input
                    id="autoSave"
                    type="number"
                    value={autoSaveInterval}
                    onChange={(e) => setAutoSaveInterval(e.target.value)}
                    min="1"
                    max="60"
                  />
                </div>

                <div>
                  <Label htmlFor="wordGoal">Daily Word Goal</Label>
                  <Input
                    id="wordGoal"
                    type="number"
                    value={dailyWordGoal}
                    onChange={(e) => setDailyWordGoal(e.target.value)}
                    min="50"
                    max="5000"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your writing progress
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Writing Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded to write every day
                    </p>
                  </div>
                  <Switch
                    checked={dailyReminders}
                    onCheckedChange={setDailyReminders}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Export Your Data</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Download all your posts and data as a JSON file
                  </p>
                  <Button onClick={handleExportData} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-red-600 dark:text-red-400">Danger Zone</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Permanently delete all your posts. This action cannot be undone.
                  </p>
                  <Button 
                    onClick={handleDeleteAllPosts} 
                    variant="destructive" 
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All Posts
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-red-600 dark:text-red-400">Account</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sign out of your account
                  </p>
                  <Button 
                    onClick={logout} 
                    variant="outline" 
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}