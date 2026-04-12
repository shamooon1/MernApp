import express from 'express';
import UsageEvent from '../models/UsageEvent.js';
import User from '../models/User.js';
import SearchQuery from '../models/SearchQuery.js';
import Stripe from 'stripe';

const router = express.Router();

// Simple admin middleware
async function requireAdmin(req, res, next) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Auth check failed' });
  }
}

// Helper: start of month
function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

// Helper: start of month UTC
function startOfMonthUTC(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}
function monthKeyUTC(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
function monthLabelUTC(d) {
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// GET /api/admin/stats/overview
router.get('/overview', requireAdmin, async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

    // Tools usage
    const usageAgg = await UsageEvent.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$toolName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const toolsUsage = usageAgg.map(x => ({ name: x._id, value: x.count }));

    // Top search queries
    const searchAgg = await SearchQuery.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const topSearches = searchAgg.map(x => ({ query: x._id, searches: x.count }));

    // Revenue data (mock for now - integrate with Stripe later)
    const revenue = {
      total: 1250,
      currency: 'usd',
      monthly: [
        { month: '1/2025', value: 200 },
        { month: '2/2025', value: 350 },
        { month: '3/2025', value: 700 }
      ]
    };

    res.json({
      success: true,
      toolsUsage,
      topSearches,
      revenue
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to load admin stats' });
  }
});

// GET /api/admin/stats/searches - More detailed search analytics
router.get('/searches', requireAdmin, async (req, res) => {
  try {
    const { period = '30d', limit = 20 } = req.query;
    
    // Calculate date range
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Top searches by frequency
    const topSearches = await SearchQuery.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Searches by tool
    const searchesByTool = await SearchQuery.aggregate([
      { $match: { createdAt: { $gte: since }, toolName: { $exists: true } } },
      { $group: { _id: '$toolName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Searches over time (daily)
    const searchTrend = await SearchQuery.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      period,
      topSearches: topSearches.map(s => ({ query: s._id, count: s.count })),
      searchesByTool: searchesByTool.map(s => ({ tool: s._id, count: s.count })),
      searchTrend: searchTrend.map(s => ({ date: s._id, count: s.count }))
    });
  } catch (err) {
    console.error('Search stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to load search stats' });
  }
});

// GET /api/admin/stats/stripe-revenue?months=12&currency=usd&metric=gross
router.get('/stripe-revenue', requireAdmin, async (req, res) => {
  try {
    const months = Math.max(1, Math.min(parseInt(req.query.months || '12', 10), 36));
    const currency = String(req.query.currency || 'usd').toLowerCase(); // use "all" to aggregate per currency
    const metric = String(req.query.metric || 'gross').toLowerCase(); // gross | net

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ success: false, message: 'Stripe not configured' });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Build UTC month buckets
    const buckets = [];
    const current = startOfMonthUTC(new Date());
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(current);
      d.setUTCMonth(d.getUTCMonth() - i);
      buckets.push({
        key: monthKeyUTC(d),
        label: monthLabelUTC(d),
        amounts: new Map(), // currency -> minor units
      });
    }
    const idxByKey = new Map(buckets.map((b, i) => [b.key, i]));

    const firstMonth = new Date(current);
    firstMonth.setUTCMonth(firstMonth.getUTCMonth() - (months - 1));
    const sinceEpoch = Math.floor(firstMonth.getTime() / 1000);

    const add = (unix, minor, curr) => {
      if (!minor || !curr) return;
      const d = new Date(unix * 1000);
      const key = monthKeyUTC(d);
      const i = idxByKey.get(key);
      if (i === undefined) return;
      const map = buckets[i].amounts;
      map.set(curr, (map.get(curr) || 0) + minor);
    };

    if (metric === 'net') {
      // Accurate net revenue (fees/refunds accounted) using balance transactions
      // Sum types: charge and refund
      for await (const bt of stripe.balanceTransactions.list({
        created: { gte: sinceEpoch },
        limit: 100,
        // type filter narrows to charges, but refunds are separate type; we’ll paginate both
      })) {
        if (bt.type === 'charge' || bt.type === 'refund') {
          add(bt.created, bt.net, bt.currency); // bt.net already includes fees/refunds sign
        }
      }
    } else {
      // Gross revenue = sum(charge.amount - charge.amount_refunded), succeeded only
      for await (const ch of stripe.charges.list({
        created: { gte: sinceEpoch },
        limit: 100,
      })) {
        if (ch.status === 'succeeded' && ch.paid) {
          const minor = (ch.amount || 0) - (ch.amount_refunded || 0);
          if (minor > 0) add(ch.created, minor, ch.currency);
        }
      }
    }

    // Shape response
    const isAll = currency === 'all';
    if (isAll) {
      // Per-currency totals and monthly breakdown
      const currencySet = new Set();
      buckets.forEach(b => b.amounts.forEach((_, c) => currencySet.add(c)));
      const totals = {};
      currencySet.forEach(c => {
        totals[c.toUpperCase()] = buckets.reduce((s, b) => s + (b.amounts.get(c) || 0), 0) / 100;
      });
      const monthlyByCurrency = buckets.map(b => {
        const row = { month: b.label };
        currencySet.forEach(c => {
          row[c.toUpperCase()] = ((b.amounts.get(c) || 0) / 100);
        });
        return row;
      });
      return res.json({ success: true, currency: 'ALL', totals, monthlyByCurrency, metric });
    } else {
      const totalMinor = buckets.reduce((s, b) => s + (b.amounts.get(currency) || 0), 0);
      const monthly = buckets.map(b => ({
        month: b.label,
        value: Math.round((b.amounts.get(currency) || 0)) / 100, // major units
      }));
      return res.json({
        success: true,
        currency: currency.toUpperCase(),
        total: Math.round(totalMinor) / 100,
        monthly,
        metric,
      });
    }
  } catch (error) {
    console.error('Stripe revenue error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load Stripe revenue' });
  }
});

// Add this debug route temporarily
router.get('/debug', async (req, res) => {
  try {
    // Check all users and their fields
    const allUsers = await User.find({}).select('name email subscription role createdAt');
    
    // Check all usage events
    const allUsage = await UsageEvent.find({}).limit(10).select('userId toolName createdAt');
    
    // Check unique tool names
    const toolNames = await UsageEvent.distinct('toolName');
    
    res.json({
      success: true,
      debug: {
        totalUsers: await User.countDocuments(),
        sampleUsers: allUsers,
        sampleUsage: allUsage,
        uniqueToolNames: toolNames,
        userFields: Object.keys(allUsers[0]?.toObject() || {}),
        usageFields: Object.keys(allUsage[0]?.toObject() || {})
      }
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Updated dashboard route with better logic
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Total registered users
    const totalUsers = await User.countDocuments({});

    // Active users this month - users who have ANY usage events
    const activeUserIds = await UsageEvent.distinct('userId', {
      createdAt: { $gte: startOfMonth },
      userId: { $ne: null, $exists: true } // Exclude null userIds
    });
    const activeUsers = activeUserIds.length;

    // Premium users - FIX: Use correct case-sensitive values
    const premiumUsers = await User.countDocuments({
      subscription: { $in: ['Premium', 'Pro', 'premium', 'pro', 'yearly', 'monthly'] }
    });

    // AI requests using the actual tool names from your database
    const totalAiRequests = await UsageEvent.countDocuments({
      toolName: { $in: ['Content Gen', 'Content Improve'] }
    });
    
    // Today's requests
    const todayRequests = await UsageEvent.countDocuments({
      toolName: { $in: ['Content Gen', 'Content Improve'] },
      createdAt: { $gte: startOfToday }
    });

    // Searches this month (using SearchQuery instead of SearchLog)
    const searchesThisMonth = await SearchQuery.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Content generated - specifically Content Gen tool usage
    const contentGenerated = await UsageEvent.countDocuments({
      toolName: 'Content Gen'
    });

    // Calculate some percentages for better insights
    const activeUserPercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    const premiumPercentage = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        premiumUsers,
        totalAiRequests,
        todayRequests,
        searchesThisMonth,
        contentGenerated,
        averageSessionTime: 0,
        // Add some additional insights
        activeUserPercentage,
        premiumPercentage
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

export default router;