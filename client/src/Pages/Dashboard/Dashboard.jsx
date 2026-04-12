import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { logout as logoutApi, getCurrentUser, isAuthenticated } from '../../services/AuthService.js';
import ContentModeration from '../Content/ContentModeration.jsx';

const Icons = {
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
      <polyline points="16,7 22,7 22,13"/>
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  )
};

const Dashboard = ({ onPageChange }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Existing state
  const [toolsData, setToolsData] = useState([]);
  const [revenueTotal, setRevenueTotal] = useState(0);
  const [revenueCurrency, setRevenueCurrency] = useState('usd');
  const [revenueMonthly, setRevenueMonthly] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [searchPeriod, setSearchPeriod] = useState('30d');
  
  // NEW: Real dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalAiRequests: 0,
    todayRequests: 0,
    contentGenerated: 0,
    searchesThisMonth: 0,
    averageSessionTime: 0
  });

  // Add missing datasets to fix ReferenceError
  const pieData = [
    { name: 'Monthly Premium', value: 60, color: '#C084FC' },
    { name: 'Yearly Premium', value: 40, color: '#E5E7EB' },
  ];

  const removeToolData = [
    { tool: 'Paraphraser', removed: 12, type: 'low_usage' },
    { tool: 'Summarizer', removed: 8, type: 'low_usage' },
    { tool: 'Grammar Fixer', removed: 4, type: 'deprecated' },
  ];

  useEffect(() => {
    const init = async () => {
      const currentUser = getCurrentUser();
      if (!isAuthenticated() || currentUser?.role !== 'admin') return onPageChange('login');
      setUser(currentUser);

      try {
        // Fetch dashboard statistics
        const statsResponse = await fetch('/api/admin/stats/dashboard', { 
          credentials: 'include' 
        });
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setDashboardStats(statsData.stats);
        }

        // keep your existing overview fetch for tools/searches
        const r = await fetch('/api/admin/stats/overview', { credentials: 'include' });
        const ov = await r.json();
        if (ov.success) {
          setToolsData(ov.toolsUsage || []);
          setSearchData(ov.topSearches || []);
        }
        
        // live Stripe revenue
        const sr = await fetch('/api/admin/stats/stripe-revenue?months=12&currency=usd&metric=gross', { credentials: 'include' });
        const rev = await sr.json();
        if (rev.success) {
          setRevenueTotal(rev.total || 0);
          setRevenueCurrency(rev.currency || 'USD');
          setRevenueMonthly(rev.monthly || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [onPageChange]);

  // Updated stats with real data
  const stats = [
    {
      title: 'Total Users',
      value: dashboardStats.totalUsers.toLocaleString(),
      change: '+0%', // You can calculate this from last month's data
      bgColor: 'from-blue-500 to-blue-600',
      description: 'Registered users'
    },
    {
      title: 'Active This Month',
      value: dashboardStats.activeUsers.toLocaleString(),
      icon: 'Users',
      bgColor: 'from-blue-500 to-blue-600',
      description: 'Users who used AI tools'
    },
    {
      title: 'Premium Users',
      value: dashboardStats.premiumUsers.toLocaleString(),
      icon: 'Users',
      bgColor: 'from-blue-500 to-blue-600',
      description: 'Paying subscribers'
    },
    {
      title: 'AI Requests Today',
      value: dashboardStats.todayRequests.toLocaleString(),
      change: `${dashboardStats.totalAiRequests.toLocaleString()} total`,
      icon: 'Users',
      bgColor: 'from-blue-500 to-blue-600',
      description: 'AI generations today'
    }
  ];

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutApi();            // call real logout
      onPageChange?.('login');      // or 'home' depending on your app
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4">Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
          
              </div>
              <div className="flex items-center space-x-2">
                <Icons.User />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title={loggingOut ? 'Logging out...' : 'Log out'}
              >
                <Icons.LogOut />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Updated Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-gradient-to-r ${stat.bgColor} rounded-xl p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Icons.Users />
                    <span className="text-sm opacity-90">{stat.title}</span>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center space-x-1 mt-2">
                    <Icons.TrendingUp />
                    <span className="text-sm opacity-90">{stat.change}</span>
                  </div>
                  <div className="text-xs opacity-75 mt-1">{stat.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tools Being Used */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Tools being used</h2>
              <button className="flex items-center space-x-1 text-sm bg-white bg-opacity-20 px-3 py-1 rounded-lg">
                <span>This Month</span>
                <Icons.ChevronDown />
              </button>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={toolsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'white' }}
                  />
                  <YAxis hide />
                  <Bar dataKey="value" fill="#ffffff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Premium Users */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-6">Premium Users</h2>
            <div className="flex items-center justify-center h-48">
              <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">50%</span>
                </div>
              </div>
              <div className="ml-8">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-sm">Monthly Premium</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm">Yearly Premium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Highest Number of Searches */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Highest number of searches</h2>
              <div className="relative">
                <select
                  value={searchPeriod}
                  onChange={(e) => fetchSearchData(e.target.value)}
                  className="appearance-none bg-white bg-opacity-20 px-3 py-1 pr-8 rounded-lg text-sm text-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                >
                  <option value="7d" className="text-black-900">Last 7 days</option>
                  <option value="30d" className="text-black-900">This Month</option>
                  <option value="90d" className="text-black-900">Last 3 months</option>
                </select>
                <Icons.ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-4">
              {searchData.length === 0 ? (
                <div className="text-center py-8 text-white text-opacity-70">
                  No search data available
                </div>
              ) : (
                searchData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div 
                        className="w-2 h-8 rounded-full"
                        style={{
                          backgroundColor: index === 0 ? '#ef4444' : 
                                          index === 1 ? '#f97316' : 
                                          index === 2 ? '#fbbf24' : '#60a5fa'
                        }}
                      ></div>
                      <span className="text-sm truncate">{item.query}</span>
                    </div>
                    <span className="text-sm font-medium ml-4">{item.searches}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Remove Any Tool */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Tools</h2>
              <button className="flex items-center space-x-1 text-sm bg-white bg-opacity-20 px-3 py-1 rounded-lg">
                <span>This Month</span>
                <Icons.ChevronDown />
              </button>
            </div>
            <div className="space-y-4">
              {removeToolData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs text-black">
                      {item.tool}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.removed}</div>
                    <div className="text-xs opacity-70">
                      {item.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">
              {revenueCurrency === 'USD' ? '$' : ''}{revenueTotal.toLocaleString()}
            </h2>
            <p className="text-sm opacity-70 mb-6">Revenue</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueMonthly}>
                  <XAxis dataKey="month" hide />
                  <YAxis hide />
                  <Bar dataKey="value" fill="rgba(255,255,255,0.8)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-4 text-xs opacity-70">
              <span>Last 12 months</span>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-center h-full">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2.5 * Math.PI * 40 * 0.75} ${2.5 * Math.PI * 40}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">1</span>
                  <span className="text-xs opacity-70">Monthly visitors</span>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>• Desktop</span>
                <span>5,649</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>• Desktop</span>
                <span>5,649</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>• Desktop</span>
                <span>5,420</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;