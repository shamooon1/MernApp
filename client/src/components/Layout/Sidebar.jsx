import React, { useState } from 'react';

const Icons = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a3 3 0 0 0-6 0m0 8a3 3 0 0 0 6 0"/>
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M3 3v18h18"/>
      <path d="M18 17V9"/>
      <path d="M13 17V5"/>
      <path d="M8 17v-3"/>
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="16.5" x2="7.5" y1="9.4" y2="4.21"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.29,7 12,12 20.71,7"/>
      <line x1="12" x2="12" y1="22" y2="12"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  )
};

export default function Sidebar({ isOpen, onClose, currentPage, onPageChange }) {
  const [expandedSections, setExpandedSections] = useState({
    users: false,
    content: false,
    models: false,
    analytics: false,
    plans: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuItems = [
    {
      title: 'Dashboard',
      page: 'admin-dashboard', // was 'dashboard'
      icon: 'Home'
    },
    {
      title: 'User Management',
      icon: 'Users',
      section: 'users',
      children: [
        { title: 'Users', page: 'users' },

      ]
    },
    {
      title: 'Content Moderation',
      icon: 'Shield',
      section: 'content',
      children: [
        // Change page to slug that App expects
        { title: 'Content', page: 'content-moderation' },
      ]
    },

    {
      title: 'Analytics',
      icon: 'BarChart',
      section: 'analytics',
      children: [
        { title: 'Platform Usage', page: 'platform-usage' },
        { title: 'User Metrics', page: 'user-metrics' },
        { title: 'Feature Analytics', page: 'feature-analytics' },
      ]
    },
    {
      title: 'Plan Management',
      icon: 'Package',
      section: 'plans',
      children: [
        { title: 'Subscription Plans', page: 'subscription-plans' },
      ]
    }
  ];

  const isActivePage = (page) => {
    return currentPage === page;
  };

  const handlePageChange = (page) => {
    onPageChange(page);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-600 shadow-lg transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        <div className="flex items-center justify-center h-16 px-4 border-b border-blue-700">
          <h1 className="text-xl font-bold text-white"></h1>
        </div>

        <nav className="mt-4 px-2 pb-20">
          {menuItems.map((item) => (
            <div key={item.title} className="mb-2">
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.section)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left text-white rounded-lg hover:bg-blue-500 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      {React.createElement(Icons[item.icon])}
                      <span className="ml-3 font-medium">{item.title}</span>
                    </div>
                    {expandedSections[item.section] ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                  </button>
                  
                  {expandedSections[item.section] && (
                    <div className="mt-2 ml-6 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.page}
                          onClick={() => handlePageChange(child.page)}
                          className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                            isActivePage(child.page)
                              ? 'bg-blue-500 text-white font-medium'
                              : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                          }`}
                        >
                          {child.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handlePageChange(item.page)}
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActivePage(item.page)
                      ? 'bg-blue-500 text-white font-medium'
                      : 'text-white hover:bg-blue-500'
                  }`}
                >
                  {React.createElement(Icons[item.icon])}
                  <span className="ml-3">{item.title}</span>
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700 bg-blue-600">
          <div className="text-xs text-blue-100 text-center">
          
          </div>
        </div>
      </div>
    </>
  );
};

