import express from 'express';
import { PlatformUsage, FeatureUsage, Feedback } from '../models/Analytics.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware for admin access
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Auth check failed' });
  }
};

// GET /api/analytics/platform-usage
router.get('/platform-usage', requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Daily active users
    const dailyUsers = await PlatformUsage.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          uniqueUsers: { $addToSet: '$userId' },
          totalSessions: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id.date',
          activeUsers: { $size: '$uniqueUsers' },
          totalSessions: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Device breakdown
    const deviceStats = await PlatformUsage.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          device: '$_id',
          sessions: '$count',
          users: { $size: '$uniqueUsers' }
        }
      }
    ]);

    // Average session duration
    const avgDuration = await PlatformUsage.aggregate([
      { 
        $match: { 
          createdAt: { $gte: since },
          duration: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          totalSessions: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      period,
      dailyUsers,
      deviceStats,
      avgSessionDuration: avgDuration[0]?.avgDuration || 0,
      totalSessions: avgDuration[0]?.totalSessions || 0
    });

  } catch (error) {
    console.error('Platform usage analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to load platform usage data' });
  }
});

// GET /api/analytics/feature-usage
router.get('/feature-usage', requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Most used features
    const topFeatures = await FeatureUsage.aggregate([
      { $match: { lastUsed: { $gte: since } } },
      {
        $group: {
          _id: '$featureName',
          totalUsage: { $sum: '$usageCount' },
          uniqueUsers: { $addToSet: '$userId' },
          avgTimeSpent: { $avg: '$totalTime' },
          category: { $first: '$category' }
        }
      },
      {
        $project: {
          feature: '$_id',
          totalUsage: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          avgTimeSpent: { $round: ['$avgTimeSpent', 2] },
          category: 1
        }
      },
      { $sort: { totalUsage: -1 } },
      { $limit: 10 }
    ]);

    // Feature usage by category
    const categoryStats = await FeatureUsage.aggregate([
      { $match: { lastUsed: { $gte: since } } },
      {
        $group: {
          _id: '$category',
          totalUsage: { $sum: '$usageCount' },
          uniqueUsers: { $addToSet: '$userId' },
          features: { $addToSet: '$featureName' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalUsage: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          featureCount: { $size: '$features' }
        }
      },
      { $sort: { totalUsage: -1 } }
    ]);

    // Feature adoption trend (daily)
    const adoptionTrend = await FeatureUsage.aggregate([
      { $match: { lastUsed: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$lastUsed' } }
          },
          totalUsage: { $sum: '$usageCount' },
          uniqueFeatures: { $addToSet: '$featureName' }
        }
      },
      {
        $project: {
          date: '$_id.date',
          totalUsage: 1,
          featuresUsed: { $size: '$uniqueFeatures' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      period,
      topFeatures,
      categoryStats,
      adoptionTrend
    });

  } catch (error) {
    console.error('Feature usage analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to load feature usage data' });
  }
});

// GET /api/analytics/feedback-metrics
router.get('/feedback-metrics', requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Overall satisfaction (ratings)
    const satisfactionStats = await Feedback.aggregate([
      { 
        $match: { 
          createdAt: { $gte: since },
          type: 'rating',
          rating: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Average rating
    const avgRating = await Feedback.aggregate([
      { 
        $match: { 
          createdAt: { $gte: since },
          type: 'rating',
          rating: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    // Feedback by type
    const feedbackByType = await Feedback.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Feedback by status
    const feedbackByStatus = await Feedback.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent feedback
    const recentFeedback = await Feedback.find({ createdAt: { $gte: since } })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('type subject message rating feature status createdAt');

    // Feature-specific ratings
    const featureRatings = await Feedback.aggregate([
      { 
        $match: { 
          createdAt: { $gte: since },
          type: 'rating',
          feature: { $exists: true, $ne: null },
          rating: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$feature',
          avgRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      period,
      satisfactionStats,
      avgRating: avgRating[0]?.avgRating || 0,
      totalRatings: avgRating[0]?.totalRatings || 0,
      feedbackByType,
      feedbackByStatus,
      recentFeedback,
      featureRatings
    });

  } catch (error) {
    console.error('Feedback metrics error:', error);
    res.status(500).json({ success: false, message: 'Failed to load feedback data' });
  }
});

// POST /api/analytics/track-usage
router.post('/track-usage', async (req, res) => {
  try {
    const { type, data } = req.body;

    switch (type) {
      case 'session':
        const usage = new PlatformUsage({
          userId: req.session?.userId,
          sessionId: data.sessionId,
          device: data.device || 'desktop',
          browser: data.browser,
          os: data.os,
          location: data.location,
          duration: data.duration,
          pagesVisited: data.pagesVisited
        });
        await usage.save();
        break;

      case 'feature':
        await FeatureUsage.findOneAndUpdate(
          { 
            userId: req.session?.userId,
            featureName: data.featureName 
          },
          {
            $inc: { usageCount: 1, totalTime: data.timeSpent || 0 },
            $set: { 
              lastUsed: new Date(),
              category: data.category 
            }
          },
          { upsert: true }
        );
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid tracking type' });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Usage tracking error:', error);
    res.status(500).json({ success: false, message: 'Failed to track usage' });
  }
});

// POST /api/analytics/feedback
router.post('/feedback', async (req, res) => {
  try {
    const { type, rating, subject, message, feature } = req.body;

    if (!type || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type, subject, and message are required' 
      });
    }

    const feedback = new Feedback({
      userId: req.session?.userId,
      type,
      rating: type === 'rating' ? rating : undefined,
      subject,
      message,
      feature
    });

    await feedback.save();

    res.json({ 
      success: true, 
      message: 'Feedback submitted successfully',
      feedbackId: feedback._id
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
});

export default router;