import express from 'express';
import { logSearch } from '../utils/searchLogger.js';

const router = express.Router();

router.post('/log', async (req, res) => {
  try {
    const { query, toolName, source } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query required' });
    }

    await logSearch(query, req.session?.userId, toolName, source);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Search log error:', error);
    res.status(500).json({ success: false, message: 'Failed to log search' });
  }
});

export default router;