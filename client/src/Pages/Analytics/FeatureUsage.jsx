import React, { useState, useEffect } from 'react';

const FeatureUsage = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState({
    topFeatures: [],
    categoryStats: [],
    adoptionTrend: []
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/feature-usage?period=${period}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success) {
          setData({
            topFeatures: json.topFeatures || [],
            categoryStats: json.categoryStats || [],
            adoptionTrend: json.adoptionTrend || []
          });
        }
      } catch (e) {
        console.error('Feature usage load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [period]);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      ai_tool: 'bg-blue-500',
      content: 'bg-green-500',
      export: 'bg-purple-500',
      collaboration: 'bg-orange-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      ai_tool: '',
      content: '',
      export: '',
      collaboration: ''
    };
    return icons[category] || '';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feature Usage Analytics</h1>
            <p className="text-gray-600 mt-1">Track most used features and user preferences</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading analytics...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Category Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {data.categoryStats.map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{getCategoryIcon(cat.category)}</span>
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(cat.category)}`}></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {cat.category.replace('_', ' ')}
                  </h3>
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Uses</span>
                      <span className="font-bold text-gray-900">{cat.totalUsage}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unique Users</span>
                      <span className="font-bold text-gray-900">{cat.uniqueUsers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Features</span>
                      <span className="font-bold text-gray-900">{cat.featureCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Features Leaderboard */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Top Features Leaderboard</h2>
              {data.topFeatures.length ? (
                <div className="space-y-3">
                  {data.topFeatures.map((feature, idx) => {
                    const maxUsage = Math.max(...data.topFeatures.map(f => f.totalUsage));
                    const percentage = (feature.totalUsage / maxUsage) * 100;
                    const isTopThree = idx < 3;
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                          isTopThree ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' : 'bg-gray-50'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                            idx === 1 ? 'bg-gray-300 text-gray-700' :
                            idx === 2 ? 'bg-orange-300 text-orange-900' :
                            'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {idx === 0 ? '' : idx === 1 ? '' : idx === 2 ? '' : idx + 1}
                        </div>

                        {/* Feature Info */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{feature.feature}</h3>
                              <p className="text-xs text-gray-500 capitalize">
                                {feature.category?.replace('_', ' ')} • {feature.uniqueUsers} users
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {feature.totalUsage}
                              </div>
                              <div className="text-xs text-gray-500">uses</div>
                            </div>
                          </div>

                          {/* Usage Bar */}
                          <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all bg-gradient-to-r from-blue-500 to-blue-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          {/* Average Time */}
                          {feature.avgTimeSpent > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              Avg time: {formatTime(feature.avgTimeSpent)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No feature usage data available
                </div>
              )}
            </div>

            {/* Adoption Trend Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Feature Adoption Trend</h2>
              {data.adoptionTrend.length ? (
                <div className="space-y-2">
                  {data.adoptionTrend.slice(-14).reverse().map((day, idx) => {
                    const maxUsage = Math.max(...data.adoptionTrend.map(d => d.totalUsage));
                    const percentage = (day.totalUsage / maxUsage) * 100;
                    
                    return (
                      <div key={idx} className="flex items-center space-x-4">
                        <div className="w-24 text-sm text-gray-600 font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-8 relative">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full flex items-center justify-between px-3 transition-all"
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="text-white text-sm font-medium">
                                {day.totalUsage} uses
                              </span>
                              <span className="text-white text-xs">
                                {day.featuresUsed} features
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No adoption trend data available
                </div>
              )}
            </div>

            {/* Feature Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Most Popular</h3>
                <p className="text-3xl font-bold mb-1">
                  {data.topFeatures[0]?.feature || 'N/A'}
                </p>
                <p className="text-blue-100 text-sm">
                  {data.topFeatures[0]?.totalUsage || 0} total uses
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Engagement Leader</h3>
                <p className="text-3xl font-bold mb-1">
                  {data.topFeatures.reduce((max, f) => 
                    f.avgTimeSpent > (max?.avgTimeSpent || 0) ? f : max, data.topFeatures[0]
                  )?.feature || 'N/A'}
                </p>
                <p className="text-green-100 text-sm">
                  Highest avg time spent
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Total Features Used</h3>
                <p className="text-3xl font-bold mb-1">
                  {data.topFeatures.length}
                </p>
                <p className="text-purple-100 text-sm">
                  Across all categories
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureUsage;