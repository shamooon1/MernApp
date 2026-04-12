import React, { useState, useEffect } from 'react';

const PlatformUsage = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState({
    dailyUsers: [],
    deviceStats: [],
    avgSessionDuration: 0,
    totalSessions: 0
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/platform-usage?period=${period}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success) {
          setData({
            dailyUsers: json.dailyUsers || [],
            deviceStats: json.deviceStats || [],
            avgSessionDuration: json.avgSessionDuration || 0,
            totalSessions: json.totalSessions || 0
          });
        }
      } catch (e) {
        console.error('Platform usage load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [period]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Usage Analytics</h1>
            <p className="text-gray-600 mt-1">Monitor user sessions, devices, and engagement metrics</p>
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
            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Sessions</p>
                    <p className="text-2xl font-bold mt-2">{data.totalSessions}</p>
                  </div>
                  <div className="text-3xl opacity-20"></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Avg Session Duration</p>
                    <p className="text-2xl font-bold mt-2">
                      {formatDuration(data.avgSessionDuration)}
                    </p>
                  </div>
                  <div className="text-5xl opacity-20"></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Active Days</p>
                    <p className="text-2xl font-bold mt-2">{data.dailyUsers.length}</p>
                  </div>
                  <div className="text-5xl opacity-20"></div>
                </div>
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Device Breakdown</h2>
              {data.deviceStats.length ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.deviceStats.map((device, idx) => {
                    const total = data.deviceStats.reduce((sum, d) => sum + d.sessions, 0);
                    const percentage = ((device.sessions / total) * 100).toFixed(1);
                    
                    return (
                      <div key={idx} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold capitalize text-gray-900">
                            {device.device}
                          </h3>
                          <span className="text-3xl">
                            {device.device === 'desktop' ? '' : 
                             device.device === 'mobile' ? '' : ''}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Sessions</span>
                            <span className="font-semibold">{device.sessions}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Users</span>
                            <span className="font-semibold">{device.users}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Share</span>
                            <span className="font-semibold text-blue-600">{percentage}%</span>
                          </div>
                        </div>
                        {/* Visual bar */}
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No device data available
                </div>
              )}
            </div>

            {/* Daily Active Users Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Active Users</h2>
              {data.dailyUsers.length ? (
                <div className="space-y-2">
                  {data.dailyUsers.slice(-14).reverse().map((day, idx) => {
                    const maxUsers = Math.max(...data.dailyUsers.map(d => d.activeUsers));
                    const percentage = (day.activeUsers / maxUsers) * 100;
                    
                    return (
                      <div key={idx} className="flex items-center space-x-4">
                        <div className="w-24 text-sm text-gray-600 font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-blue-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="text-white text-sm font-medium">
                                {day.activeUsers} users
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-20 text-sm text-gray-600 text-right">
                          {day.totalSessions} sessions
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No daily user data available
                </div>
              )}
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Average Sessions per Day</span>
                    <span className="font-bold text-blue-600">
                      {data.dailyUsers.length > 0
                        ? Math.round(data.totalSessions / data.dailyUsers.length)
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Peak Active Users</span>
                    <span className="font-bold text-green-600">
                      {Math.max(...data.dailyUsers.map(d => d.activeUsers), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Average Users per Day</span>
                    <span className="font-bold text-purple-600">
                      {data.dailyUsers.length > 0
                        ? Math.round(
                            data.dailyUsers.reduce((sum, d) => sum + d.activeUsers, 0) /
                              data.dailyUsers.length
                          )
                        : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Insights</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Most Active Device: </span>
                      {data.deviceStats.length > 0
                        ? data.deviceStats.reduce((max, d) =>
                            d.sessions > max.sessions ? d : max
                          ).device
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Engagement Trend: </span>
                      {data.dailyUsers.length > 7 &&
                      data.dailyUsers.slice(-7).reduce((sum, d) => sum + d.activeUsers, 0) >
                        data.dailyUsers.slice(-14, -7).reduce((sum, d) => sum + d.activeUsers, 0)
                        ? '📈 Increasing'
                        : '📉 Stable'}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Session Quality: </span>
                      {data.avgSessionDuration > 180 ? ' Excellent' : 
                       data.avgSessionDuration > 120 ? ' Good' : 
                       data.avgSessionDuration > 60 ? ' Fair' : ' Needs Improvement'}
                    </p>
                  </div>
                </div>
              </div>
            </div> 
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformUsage;