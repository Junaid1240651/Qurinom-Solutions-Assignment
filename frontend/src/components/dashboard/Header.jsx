import { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown,
  Search,
  Menu
} from 'lucide-react';

const Header = ({ user, onLogout, showUserMenu, setShowUserMenu }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowUserMenu]);

  const notifications = [
    {
      id: 1,
      title: 'New comment on "Website Redesign"',
      message: 'John added a comment to the card',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      title: 'Board invitation',
      message: 'You were invited to "Marketing Campaign"',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      title: 'Due date reminder',
      message: 'Task "Review mockups" is due tomorrow',
      time: '3 hours ago',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-accent-200 sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TM</span>
                </div>
                <span className="ml-2 text-xl font-bold text-accent-900">TaskManager</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent-400" />
              <input
                type="text"
                placeholder="Search across all boards..."
                className="w-64 pl-10 pr-4 py-2 text-sm border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-accent-600 hover:text-accent-900 hover:bg-accent-100 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-accent-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-accent-100">
                    <h3 className="text-sm font-semibold text-accent-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-accent-50 cursor-pointer ${
                          notification.unread ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-accent-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-accent-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-accent-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-accent-100">
                    <button className="text-sm text-primary-600 hover:text-primary-700">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-accent-600 hover:text-accent-900 hover:bg-accent-100 rounded-lg transition-colors"
              >
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-accent-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-accent-100">
                    <p className="text-sm font-medium text-accent-900">{user?.name}</p>
                    <p className="text-xs text-accent-600">{user?.email}</p>
                  </div>
                  
                  <button className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  
                  <button className="w-full px-4 py-2 text-left text-sm text-accent-700 hover:bg-accent-100 flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  
                  <div className="border-t border-accent-100 mt-2 pt-2">
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-accent-600 hover:text-accent-900 hover:bg-accent-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-accent-200 py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent-400" />
                <input
                  type="text"
                  placeholder="Search across all boards..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-accent-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Mobile User Info */}
              <div className="flex items-center space-x-3 p-3 bg-accent-50 rounded-lg">
                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-accent-900">{user?.name}</p>
                  <p className="text-xs text-accent-600">{user?.email}</p>
                </div>
              </div>

              {/* Mobile Menu Items */}
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-accent-700 hover:bg-accent-100 rounded-lg">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-accent-700 hover:bg-accent-100 rounded-lg">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-accent-700 hover:bg-accent-100 rounded-lg">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;