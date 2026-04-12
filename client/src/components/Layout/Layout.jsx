import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const Layout = ({ children, currentPage, onPageChange, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const pageTitles = {
    'dashboard': 'Dashboard',
    'users': 'All Users',
    'user-roles': 'User Roles',
    'registrations': 'User Registrations',
    'subscriptions': 'User Subscriptions',
    'flagged-content': 'Flagged Content',
    'review-queue': 'Review Queue',
    'content-reports': 'Content Reports',
    'model-settings': 'Model Settings',
    'feature-toggles': 'Feature Toggles',
    'api-config': 'API Configuration',
    'platform-usage': 'Platform Usage',
    'user-metrics': 'User Metrics',
    'feature-analytics': 'Feature Analytics',
    'analytics-reports': 'Analytics Reports',
    'subscription-plans': 'Subscription Plans',
    'pricing-tiers': 'Pricing Tiers',
    'usage-limits': 'Usage Limits'
  };

  const currentPageTitle = pageTitles[currentPage] || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Topbar 
          onMenuClick={toggleSidebar}
          currentPageTitle={currentPageTitle}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;