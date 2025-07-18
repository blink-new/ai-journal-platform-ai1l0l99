import { useState } from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Switch } from './ui/switch'
import { PenTool, Settings, LogOut, Moon, Sun, User, FolderLock } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface HeaderProps {
  darkMode: boolean
  onToggleDarkMode: () => void
  onOpenSettings: () => void
  currentView: 'dashboard' | 'writing' | 'folders'
  onViewChange: (view: 'dashboard' | 'writing' | 'folders') => void
}

export const Header = ({ darkMode, onToggleDarkMode, onOpenSettings, currentView, onViewChange }: HeaderProps) => {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <PenTool className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
                Journal AI
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('dashboard')}
                className="text-sm"
              >
                Dashboard
              </Button>
              <Button
                variant={currentView === 'folders' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('folders')}
                className="text-sm"
              >
                <FolderLock className="w-4 h-4 mr-2" />
                Folders
              </Button>
              <Button
                variant={currentView === 'writing' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('writing')}
                className="text-sm"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Write
              </Button>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <Switch
                checked={darkMode}
                onCheckedChange={onToggleDarkMode}
                className="data-[state=checked]:bg-amber-500"
              />
              <Moon className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-sm">
                      {user?.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}