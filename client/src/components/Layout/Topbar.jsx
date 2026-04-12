import React, { useState } from 'react';

const Icons = {
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="3" x2="21" y1="6" y2="6"/>
      <line x1="3" x2="21" y1="12" y2="12"/>
      <line x1="3" x2="21" y1="18" y2="18"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a3 3 0 0 0-6 0m0 8a3 3 0 0 0 6 0"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  )
};

export default function Topbar({ onMenuClick, currentPageTitle, onLogout }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-blue-600 shadow-sm border-b border-blue-700">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-1 rounded-md text-blue-100 hover:text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
          >
            <Icons.Menu />
          </button>

          <div className="ml-4 lg:ml-0">
            <h1 className="text-2xl font-semibold text-white">{currentPageTitle || 'Dashboard'}</h1>
          </div>
        </div>

        {/* Center - Search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.Search className="text-blue-100" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-blue-500 rounded-md leading-5 bg-blue-600 text-white placeholder-blue-200 focus:outline-none focus:placeholder-blue-100 focus:ring-1 focus:ring-white focus:border-white sm:text-sm"
              placeholder="Search users, content, settings..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-blue-100 hover:text-white hover:bg-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Icons.Bell />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-500">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="p-2 text-blue-100 hover:text-white hover:bg-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-white">
            <Icons.Settings />
          </button>

          <div className="relative">
            {/* Profile avatar button - toggles profile dropdown */}
            <button
              onClick={() => setShowProfile(prev => !prev)}
              className="p-2 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white flex items-center"
              aria-haspopup="true"
              aria-expanded={showProfile}
            >
              <span className="sr-only">Open profile menu</span>
              <Icons.User />
              <span className="ml-2 hidden sm:inline text-sm text-white">Account</span>
              <Icons.ChevronDown />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <Icons.User />
                    <span className="ml-3">Profile</span>
                  </button>
                  <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <Icons.Settings />
                    <span className="ml-3">Settings</span>
                  </button>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={() => { setShowProfile(false); onLogout && onLogout(); }}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Icons.LogOut />
                    <span className="ml-3">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden px-4 pb-4 bg-blue-600">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icons.Search />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-blue-500 rounded-md leading-5 bg-blue-600 text-white placeholder-blue-200 focus:outline-none focus:placeholder-blue-100 focus:ring-1 focus:ring-white focus:border-white sm:text-sm"
            placeholder="Search..."
          />
        </div>
      </div>
    </header>
  );
};

