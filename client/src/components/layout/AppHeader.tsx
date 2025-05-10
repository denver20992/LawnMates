import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Bell, User, LogOut, Settings, CheckSquare } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';

// Import the logo
import lawnmatesLogo from '@assets/lawnmates-logo-horizontal.png.png';

interface AppHeaderProps {
  title?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount, markAllAsRead, notifications } = useNotifications();
  const [location] = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'property_owner':
        return 'Property Owner';
      case 'landscaper':
        return 'Landscaper';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  return (
    <header className="bg-[#FFFDF7] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src={lawnmatesLogo} 
                  alt="LawnMates Logo" 
                  className="h-10 w-auto"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none';
                    const sibling = e.currentTarget.nextElementSibling;
                    if (sibling && sibling instanceof HTMLElement) {
                      sibling.style.display = 'flex';
                    }
                  }} 
                />
                <div className="flex items-center ml-1" style={{display: 'none'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-1 text-xl font-bold text-neutral-800">LawnMates</span>
                </div>
              </Link>
            </div>
            {isAuthenticated && (
              <nav className="ml-6 hidden md:flex md:space-x-8">
                <Link href="/" className={`inline-flex items-center border-b-2 ${
                    location === '/' ? 'border-primary-500 text-neutral-900' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                  } px-1 pt-1 text-sm font-medium`}>
                    Dashboard
                </Link>
                <Link href="/jobs" className={`inline-flex items-center border-b-2 ${
                    location.startsWith('/jobs') ? 'border-primary-500 text-neutral-900' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                  } px-1 pt-1 text-sm font-medium`}>
                    Jobs
                </Link>
                <Link href="/messages" className={`inline-flex items-center border-b-2 ${
                    location.startsWith('/messages') ? 'border-primary-500 text-neutral-900' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                  } px-1 pt-1 text-sm font-medium`}>
                    Messages
                </Link>
                <Link href="/profile" className={`inline-flex items-center border-b-2 ${
                    location.startsWith('/profile') ? 'border-primary-500 text-neutral-900' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                  } px-1 pt-1 text-sm font-medium`}>
                    Profile
                </Link>
                <Link href="/reviews" className={`inline-flex items-center border-b-2 ${
                    location.startsWith('/reviews') ? 'border-primary-500 text-neutral-900' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                  } px-1 pt-1 text-sm font-medium`}>
                    Reviews
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin" className={`inline-flex items-center border-b-2 ${
                      location.startsWith('/admin') ? 'border-primary-500 text-neutral-900' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                    } px-1 pt-1 text-sm font-medium`}>
                      Admin
                  </Link>
                )}
              </nav>
            )}
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative mr-2">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white"></span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between p-2">
                      <span className="text-sm font-medium">Notifications</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        Mark all as read
                      </Button>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-neutral-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer">
                            <div className="flex items-start space-x-2">
                              <div className={`mt-0.5 rounded-full p-1 ${
                                notification.read 
                                  ? 'bg-neutral-100' 
                                  : notification.type === 'message'
                                  ? 'bg-secondary-100'
                                  : notification.type === 'payment'
                                  ? 'bg-accent-100'
                                  : 'bg-primary-100'
                              }`}>
                                {notification.type === 'message' && <CheckSquare className="h-4 w-4" />}
                                {notification.type === 'job' && <CheckSquare className="h-4 w-4" />}
                                {notification.type === 'payment' && <CheckSquare className="h-4 w-4" />}
                                {notification.type === 'system' && <CheckSquare className="h-4 w-4" />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm ${notification.read ? 'text-neutral-500' : 'text-neutral-900 font-medium'}`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-neutral-400">
                                  {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                    {notifications.length > 5 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="p-2 text-center">
                          <Link href="/notifications" className="text-sm text-primary-600 hover:text-primary-800">
                            View all notifications
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center cursor-pointer">
                      <Avatar className="h-8 w-8">
                        {user?.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.username} />
                        ) : (
                          <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : user?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <span className="ml-2 hidden md:block text-sm font-medium text-neutral-700">
                        {user?.username} ({getRoleLabel(user?.role || '')})
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/profile/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
                  Log in
                </Link>
                <Link href="/register" className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
