import React, { useState, useEffect } from 'react';

const FeedbackMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState({
    avgRating: 0,
    totalRatings: 0,
    satisfactionStats: [],
    feedbackByType: [],
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/feedback-metrics?period=${period}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success) {
          setData({
            avgRating: json.avgRating || 0,
            totalRatings: json.totalRatings || 0,
            satisfactionStats: json.satisfactionStats || [],
            feedbackByType: json.feedbackByType || [],
          });
        }
      } catch (e) {
        console.error('Feedback metrics load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Metrics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Satisfaction Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Overall Satisfaction</h3>
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600">
                {data.avgRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Average Rating (out of 5)
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Based on {data.totalRatings} ratings
              </div>
            </div>
          </div>

          {/* Ratings Distribution Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Ratings Distribution</h3>
            {data.satisfactionStats.length ? (
              <div className="space-y-3">
                {data.satisfactionStats.map((rating, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{rating._id}★</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(rating.count / data.totalRatings) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{rating.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No ratings yet</div>
            )}
          </div>

          {/* Feedback by Type */}
          <div className="bg-white rounded-xl p-6 shadow-sm border lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Feedback by Type</h3>
            {data.feedbackByType.length ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.feedbackByType.map((type, idx) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900">{type.count}</div>
                    <div className="text-sm text-gray-600 mt-1 capitalize">
                      {type._id.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">No feedback yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackMetrics;