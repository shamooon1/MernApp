import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Middleware to check if user is admin
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

// GET all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      success: true,
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        subscription: u.subscription || 'Free',
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// UPDATE user subscription (admin only)
router.patch('/:userId/subscription', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { subscription } = req.body;

    if (!['Free', 'Premium'].includes(subscription)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription type' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { subscription },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to update subscription' });
  }
});

export default router;