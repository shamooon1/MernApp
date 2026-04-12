import express from 'express';
import UsageEvent from '../models/UsageEvent.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logSearch } from '../utils/searchLogger.js';

const router = express.Router();

let genAI = null;
let gemini = null;
let chosenModel = null;
let initializationAttempted = false;
let lastError = null;

async function initGemini(forceModel) {
  initializationAttempted = true;
  lastError = null; 
  
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    lastError = 'GEMINI_API_KEY missing';
    console.warn('GEMINI_API_KEY missing - Gemini features disabled');
    gemini = null;
    chosenModel = null;
    return false;
  }

  try {
    console.log('🔄 Creating GoogleGenerativeAI instance...');
    genAI = new GoogleGenerativeAI(key);

    const envModel = (forceModel || process.env.GEMINI_MODEL || '').trim();
    const candidates = Array.from(
      new Set(
        [
          envModel,
          'gemini-2.5-flash',   
          'gemini-2.5-pro',        
          'gemini-2.0-flash',      
          'gemini-2.0-flash-001',  
        ].filter(Boolean)
      )
    );

    console.log('🔄 Testing models:', candidates);

    gemini = null;
    chosenModel = null;

    for (const name of candidates) {
      try {
        console.log(`🔄 Testing model: ${name}`);
        const m = genAI.getGenerativeModel({ model: name });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        
        const testPromise = m.generateContent('Hi');
        const r = await Promise.race([testPromise, timeoutPromise]);
        
        const t = r?.response?.text?.() || '';
        if (t.length > 0) {
          console.log(`✅ Model "${name}" works! Response: "${t.substring(0, 50)}..."`);
          gemini = m;
          chosenModel = name;
          return true;
        } else {
          console.warn(`⚠️ Model "${name}" returned empty response`);
        }
      } catch (e) {
        const errorMsg = e?.message || String(e);
        console.warn(`❌ Model "${name}" failed: ${errorMsg}`);
        lastError = `${name}: ${errorMsg}`;
      }
    }

    lastError = 'No working models found';
    console.error('❌ No working Gemini model found');
    return false;
  } catch (error) {
    const errorMsg = error.message || String(error);
    lastError = `SDK initialization failed: ${errorMsg}`;
    console.error('❌ Gemini SDK initialization failed:', errorMsg);
    console.error('Full error:', error);
    return false;
  }
}

(async () => {
  console.log('🔄 Starting Gemini initialization...');
  try {
    const success = await initGemini();
    if (success) {
      console.log(`✅ Gemini SDK initialized with model: ${chosenModel}`);
    } else {
      console.log(`⚠️ Gemini SDK not available - Error: ${lastError}`);
      console.log('🔄 Will use REST fallback mode');
    }
  } catch (error) {
    console.error('❌ Initialization error:', error.message);
    lastError = `Startup error: ${error.message}`;
    console.log('⚠️ Falling back to REST mode');
  }
})();

router.post('/reinit', async (req, res) => {
  console.log('🔄 Manual Gemini re-initialization requested');
  const success = await initGemini(req.body?.model);
  res.json({ 
    success, 
    chosenModel, 
    lastError,
    message: success ? 'Gemini initialized successfully' : `Gemini initialization failed: ${lastError}`
  });
});

router.get('/test', async (_req, res) => {
  try {
    if (!gemini && initializationAttempted) {
      return res.json({ 
        success: false, 
        error: 'Gemini SDK not available', 
        lastError,
        fallback: 'REST mode active' 
      });
    }
    
    if (!gemini) {
      console.log('🔄 Attempting late initialization...');
      await initGemini();
    }
    
    if (!gemini) {
      return res.json({ 
        success: false, 
        error: 'Gemini initialization failed',
        lastError
      });
    }
    
    const r = await gemini.generateContent('Hello world, respond with just "OK"');
    res.json({ 
      success: true, 
      model: chosenModel, 
      response: r.response.text(),
      mode: 'SDK'
    });
  } catch (e) {
    res.json({ 
      success: false, 
      model: chosenModel, 
      error: e.message,
      lastError,
      mode: 'SDK'
    });
  }
});

router.get('/status', async (_req, res) => {
  res.json({
    sdkInitialized: !!gemini,
    currentModel: chosenModel,
    initializationAttempted,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    lastError,
    timestamp: new Date().toISOString()
  });
});

router.get('/test-rest', async (_req, res) => {
  try {
    const result = await callGenerativeREST('gemini-2.5-flash', 'Say "REST works"');
    res.json({ 
      success: true, 
      response: result,
      method: 'REST'
    });
  } catch (e) {
    res.json({ 
      success: false, 
      error: e.message,
      method: 'REST'
    });
  }
});

// Main processing endpoint (unchanged)
router.post('/process', async (req, res) => {
  try {
    const { prompt = '', type = 'generate', toolName } = req.body || {};
    
    if (!prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Log the search/query
    logSearch(prompt, req.session?.userId, toolName, 'tool_use').catch(() => {});

    // Log usage
    UsageEvent.create({
      userId: req.session?.userId || undefined,
      toolName: toolName || type || 'Content Gen',
    }).catch(() => {});

    let fullPrompt = prompt;
    if (type === 'grammar') fullPrompt = `Fix grammar/spelling. Return only corrected text:\n\n${prompt}`;
    if (type === 'tone') fullPrompt = `Improve tone and clarity. Return revised text:\n\n${prompt}`;
    if (type === 'summarize') fullPrompt = `Summarize clearly and concisely:\n\n${prompt}`;

    let text = '';
    let usedMethod = 'none';

    // Try SDK first if available
    if (gemini) {
      try {
        console.log(`🔄 Using Gemini SDK with model: ${chosenModel}`);
        const result = await gemini.generateContent(fullPrompt);
        text = result?.response?.text?.() || '';
        usedMethod = 'SDK';
        console.log('✅ SDK call successful');
      } catch (e) {
        console.warn('❌ SDK call failed, trying REST fallback:', e.message);
        // Reset gemini if it failed
        gemini = null;
        chosenModel = null;
      }
    } else {
      console.log('⚠️ Gemini SDK not initialized, using REST fallback');
    }

    // REST fallback if SDK failed or unavailable
    if (!text.trim()) {
      // Use your available models
      const models = [
        process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-2.0-flash-001',
      ];
      
      for (const model of models) {
        try {
          console.log(`🔄 Trying REST with model: ${model}`);
          const result = await callGenerativeREST(model, fullPrompt);
          if (result && result.trim()) {
            chosenModel = model;
            text = result;
            usedMethod = 'REST';
            console.log(`✅ REST call successful with ${model}`);
            break;
          }
        } catch (e) {
          console.warn(`❌ REST call failed for ${model}:`, e.message);
        }
      }
    }

    if (!text.trim()) {
      return res.status(503).json({
        success: false,
        message: 'All Gemini models failed. Check your GEMINI_API_KEY or try again later.',
      });
    }

    res.json({ 
      success: true, 
      response: text.trim(), 
      type, 
      model: chosenModel || 'unknown',
      method: usedMethod
    });
  } catch (error) {
    console.error('❌ AI processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI processing failed', 
      error: error.message 
    });
  }
});

// Helper: call v1 REST API directly
async function callGenerativeREST(model, prompt) {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  
  const json = await response.json();
  
  if (!response.ok) {
    const msg = json?.error?.message || `HTTP ${response.status}`;
    const err = new Error(msg);
    err.status = response.status;
    err.body = json;
    throw err;
  }
  
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
};

// Debug endpoint to check available models  
router.get('/models-raw', async (_req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ error: 'No GEMINI_API_KEY configured' });
    }
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );
    const json = await response.json();
    res.json(json);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;


