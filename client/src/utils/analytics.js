// Utility to track user interactions

class AnalyticsTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.pageViews = 0;
    this.currentFeature = null;
    this.featureStartTime = null;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track page/feature usage
  trackFeatureUsage(featureName, category = 'ai_tool') {
    // End previous feature tracking
    if (this.currentFeature && this.featureStartTime) {
      this.endFeatureUsage();
    }

    // Start new feature tracking
    this.currentFeature = featureName;
    this.featureStartTime = Date.now();

    // Send immediate tracking
    this.sendFeatureUsage(featureName, category, 0);
  }

  endFeatureUsage() {
    if (this.currentFeature && this.featureStartTime) {
      const timeSpent = Math.round((Date.now() - this.featureStartTime) / 1000);
      this.sendFeatureUsage(this.currentFeature, 'ai_tool', timeSpent);
      
      this.currentFeature = null;
      this.featureStartTime = null;
    }
  }

  async sendFeatureUsage(featureName, category, timeSpent) {
    try {
      await fetch('/api/analytics/track-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'feature',
          data: {
            featureName,
            category,
            timeSpent
          }
        })
      });
    } catch (error) {
      console.error('Failed to track feature usage:', error);
    }
  }

  // Track session data
  async trackSession() {
    const sessionDuration = Math.round((Date.now() - this.sessionStart) / 1000);
    
    try {
      await fetch('/api/analytics/track-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'session',
          data: {
            sessionId: this.sessionId,
            device: this.getDeviceType(),
            browser: this.getBrowser(),
            os: this.getOS(),
            location: await this.getLocation(),
            duration: sessionDuration,
            pagesVisited: this.pageViews
          }
        })
      });
    } catch (error) {
      console.error('Failed to track session:', error);
    }
  }

  // Utility methods
  getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  getOS() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
  }

  async getLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return `${data.city}, ${data.country_name}`;
    } catch (error) {
      return 'Unknown';
    }
  }

  // Submit feedback
  async submitFeedback(type, data) {
    try {
      const response = await fetch('/api/analytics/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, ...data })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      return { success: false, message: 'Failed to submit feedback' };
    }
  }
}

// Create global instance
export const analytics = new AnalyticsTracker();

// Track page unload
window.addEventListener('beforeunload', () => {
  analytics.endFeatureUsage();
  analytics.trackSession();
});