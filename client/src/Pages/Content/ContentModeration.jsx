import React, { useState, useEffect } from 'react';

const ContentModeration = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Data states
  const [contentItems, setContentItems] = useState([]);
  const [searchItems, setSearchItems] = useState([]);
  const [stats, setStats] = useState({
    totalContent: 0,
    pendingReview: 0,
    flaggedContent: 0,
    totalSearches: 0
  });

  useEffect(() => {
    loadModerationData();
  }, [activeTab, filterStatus, filterType, sortBy]);

  const loadModerationData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'content' ? '/api/admin/moderation/content' : '/api/admin/moderation/searches';
      const params = new URLSearchParams({
        status: filterStatus,
        type: filterType,
        sort: sortBy,
        search: searchQuery
      });

      const response = await fetch(`${endpoint}?${params}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        if (activeTab === 'content') {
          setContentItems(data.content || []);
        } else {
          setSearchItems(data.searches || []);
        }
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to load moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (itemId, action, reason = '') => {
    try {
      const endpoint = activeTab === 'content' ? '/api/admin/moderation/content' : '/api/admin/moderation/searches';
      const response = await fetch(`${endpoint}/${itemId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      const result = await response.json();
      if (result.success) {
        loadModerationData(); // Refresh data
        alert(`${action} action completed successfully`);
      } else {
        alert(`Failed to ${action}: ${result.message}`);
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      alert(`Failed to ${action}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return '';
      case 'image': return '';
      case 'search': return '';
      case 'comment': return '';
      case 'post': return '';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
            <p className="text-gray-600 mt-1">Monitor and moderate user content and searches</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-sm border border-blue-400">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-blue-100">Total Content</p>
        <p className="text-2xl font-bold text-white">{stats.totalContent}</p>
      </div>
      <div className="text-2xl"></div>
    </div>
  </div>
  
  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-sm border border-blue-400">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-blue-100">Pending Review</p>
        <p className="text-3xl font-bold text-white">{stats.pendingReview}</p>
      </div>
      <div className="text-4xl"></div>
    </div>
  </div>
  
  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-sm border border-blue-400">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-blue-100">Flagged Content</p>
        <p className="text-3xl font-bold text-white">{stats.flaggedContent}</p>
      </div>
      <div className="text-4xl"></div>
    </div>
  </div>
  
  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-sm border border-blue-400">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-blue-100">Total Searches</p>
        <p className="text-3xl font-bold text-white">{stats.totalSearches}</p>
      </div>
      <div className="text-4xl"></div>
    </div>
  </div>
</div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          {/* Tabs */}
          <div className="flex space-x-6 mb-6 border-b">
            <button
              onClick={() => setActiveTab('content')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
               User Content
            </button>
            <button
              onClick={() => setActiveTab('searches')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'searches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
               User Searches
            </button>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadModerationData()}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="comment">Comment</option>
                <option value="post">Post</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="flagged">Flagged First</option>
                <option value="pending">Pending First</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={loadModerationData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              {activeTab === 'content' ? 'User Content' : 'User Searches'}
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Loading moderation data...</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {(activeTab === 'content' ? contentItems : searchItems).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No items found for current filters
                </div>
              ) : (
                (activeTab === 'content' ? contentItems : searchItems).map((item, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      {/* Item Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getTypeIcon(item.type)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.type} • {formatDate(item.createdAt)}
                          </span>
                        </div>

                        {/* Content Preview */}
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {activeTab === 'content' ? item.title || 'Untitled Content' : `Search: "${item.query}"`}
                          </h4>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {activeTab === 'content' ? item.content : item.context || 'No additional context'}
                          </p>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>👤 {item.user?.name || 'Unknown User'}</span>
                          <span>📧 {item.user?.email || 'N/A'}</span>
                          {item.flagCount > 0 && (
                            <span className="text-red-600">🚩 {item.flagCount} flags</span>
                          )}
                        </div>

                        {/* Moderation Notes */}
                        {item.moderationNote && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Note:</span> {item.moderationNote}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-6">
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(item._id, 'approve')}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for rejection (optional):');
                                handleAction(item._id, 'reject', reason);
                              }}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}

                        {item.status !== 'flagged' && (
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for flagging:');
                              if (reason) handleAction(item._id, 'flag', reason);
                            }}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                          >
                            🚩 Flag
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const reason = prompt('Reason for deletion:');
                            if (reason && confirm('Are you sure you want to delete this item?')) {
                              handleAction(item._id, 'delete', reason);
                            }
                          }}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          🗑️ Delete
                        </button>

                        {/* View Details */}
                        <button
                          onClick={() => {
                            // Show detailed view modal or navigate to details page
                            alert('View details functionality can be implemented based on your needs');
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          👁️ View
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bulk Actions:</span>
              <button
                onClick={() => {
                  if (confirm('Approve all pending items?')) {
                    // Implement bulk approve
                    alert('Bulk approve functionality to be implemented');
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                Approve All Pending
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear all approved items older than 30 days?')) {
                    // Implement bulk cleanup
                    alert('Bulk cleanup functionality to be implemented');
                  }
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
              >
                Cleanup Old Items
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              Showing {(activeTab === 'content' ? contentItems : searchItems).length} items
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentModeration;