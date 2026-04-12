class AuthService {
  constructor() {
    // Fix the baseURL to include /api
    const apiBase = (import.meta.env?.VITE_API_URL || '').replace(/\/+$/, '');
    this.baseURL = apiBase ? `${apiBase}/api` : '/api'; // This should be '/api', not just '/'
    this.userKey = 'user_data';
    this.isLoggedIn = this.checkAuthStatus();
    this.user = this.getStoredUser();
    
    this.listeners = [];
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback({
      isAuthenticated: this.isLoggedIn,
      user: this.user
    }));
  }

  checkAuthStatus() {
    const userData = this.getStoredUser();
    return !!userData;
  }

  getStoredUser() {
    try {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error reading user data:', error);
      return null;
    }
  }

  setUserData(user) {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.user = user;
      this.isLoggedIn = true;
      this.notifyListeners();
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  clearUserData() {
    try {
      localStorage.removeItem(this.userKey);
      this.user = null;
      this.isLoggedIn = false;
      this.notifyListeners();
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  async login(email, password) {
    try {
      const response = await this.apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      if (response.success && response.user) {
        this.setUserData(response.user);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Network error during login' };
    }
  }

  async register(name, email, password, role = 'user') {
    try {
      const response = await this.apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password, role } // Include role in the request body
      });

      if (response.success && response.user) {
        this.setUserData(response.user);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Network error during registration' };
    }
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.clearUserData();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  async verifySession() {
    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.setUserData(data.user);
          return {
            success: true,
            user: data.user
          };
        }
      }
      
      this.clearUserData();
      return {
        success: false,
        error: 'Session expired'
      };
    } catch (error) {
      console.error('Session verification error:', error);
      this.clearUserData();
      return {
        success: false,
        error: 'Unable to verify session'
      };
    }
  }

  async apiRequest(endpoint, options = {}) {
    // Make sure endpoint doesn't start with /api since baseURL already includes it
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.replace('/api', '') : endpoint;
    const path = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
    const url = `${this.baseURL}${path}`;
    
    console.log('Making request to:', url); // Debug log
    
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: { 
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      credentials: 'include',
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await res.text();
    console.log('Response text:', text); // Debug log
    
    try {
      const json = JSON.parse(text);
      if (!res.ok) {
        throw new Error(json.message || json.error || res.statusText);
      }
      return json;
    } catch (parseError) {
      // If we get HTML instead of JSON, it means we hit the wrong endpoint
      if (text.includes('<!DOCTYPE html>')) {
        throw new Error(`Server returned HTML instead of JSON. Check if the API server is running and the endpoint is correct. Response: ${text.substring(0, 100)}...`);
      }
      throw new Error(text || 'Invalid JSON from server');
    }
  }

  getCurrentUser() {
    return this.user;
  }

  isAuthenticated() {
    return this.isLoggedIn && !!this.user;
  }

  updateUser(updatedUserData) {
    if (this.isAuthenticated()) {
      const newUserData = { ...this.user, ...updatedUserData };
      this.setUserData(newUserData);
      return newUserData;
    }
    return null;
  }
}

const authService = new AuthService();
export default authService;

export { AuthService };

export const useAuthListener = (callback) => {
  if (typeof window !== 'undefined') {
    authService.addListener(callback);
    
    return () => {
      authService.removeListener(callback);
    };
  }
};

export const login = (email, password) => authService.login(email, password);
export const register = (name, email, password) => authService.register(name, email, password);
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const base = (import.meta.env?.VITE_API_URL || '').replace(/\/+$/, '');
  
  // Clean the endpoint to avoid double /api
  const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.replace('/api', '') : endpoint;
  const path = cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`;
  
  // Construct final URL
  const url = base ? `${base}/api${path}` : `/api${path}`;
  
  console.log('Standalone apiRequest to:', url); // Debug log
  
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined
  });
  
  const text = await res.text();
  try { 
    return JSON.parse(text); 
  } catch { 
    throw new Error('Invalid JSON from server: ' + text); 
  }
};
export const verifySession = () => authService.verifySession();

