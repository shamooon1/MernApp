import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { isAuthenticated, getCurrentUser, verifySession } from './services/AuthService.js';

// Authentication Components
import LoginPage from './Pages/login/login.jsx';
import SignupPage from './Pages/login/signup.jsx';
import SmartWriteHomepage from './Pages/homepage/homepage.jsx';

// Admin Dashboard Components  
import Layout from './components/Layout/Layout.jsx';
import Dashboard from './Pages/Dashboard/Dashboard.jsx';
import Users from './Pages/Dashboard/Users.jsx';
import Plans from './Pages/Dashboard/Plans.jsx';
import AIWritingAssistant from './Pages/user/user.jsx';
import CheckoutPage from './Pages/payment/payment.jsx';
import PlatformUsage from './Pages/Analytics/PlatformUsage.jsx';
import FeedbackMetrics from './Pages/Analytics/FeedbackMetrics.jsx';
import FeatureUsage from './Pages/Analytics/FeatureUsage.jsx';
import ContentModeration from './Pages/Content/ContentModeration.jsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');



const App = () => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authPage, setAuthPage] = useState('home'); 

  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      try {
        if (isAuthenticated()) {
          const result = await verifySession();
          
          if (result?.success) {
            const userData = getCurrentUser();
            setUser(userData);
            setIsAuth(true);
            
            if (userData?.role === 'admin') {
              setCurrentPage('admin-dashboard');
            } else {
              setCurrentPage('ai-writer');
            }
          } else {
            setUser(null);
            setIsAuth(false);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAuthPageChange = (page) => {
    setAuthPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    switch (authPage) {
      case 'home':
        return <SmartWriteHomepage onNavigate={handleAuthPageChange} />;
      case 'signup':
        return <SignupPage onNavigate={handleAuthPageChange} />;
      case 'login':
      default:
        return <LoginPage onNavigate={handleAuthPageChange} />;
    }
  }

  const renderAdminPage = () => {
    switch (currentPage) {
      case 'admin-dashboard':
        return <Dashboard onPageChange={handlePageChange} />;
      case 'users':
        return <Users onPageChange={handlePageChange} />;
      case 'content-moderation':
        return <ContentModeration onPageChange={handlePageChange} />;
      case 'platform-usage':
        return <PlatformUsage onPageChange={handlePageChange} />;
      case 'user-metrics':
        return <FeedbackMetrics onPageChange={handlePageChange} />;
      case 'feature-analytics':
        return <FeatureUsage onPageChange={handlePageChange} />;
      case 'subscription-plans':
        return <Plans onPageChange={handlePageChange} />;
      default:
        return <Dashboard onPageChange={handlePageChange} />;
    }
  };

  const renderUserPage = () => {
    switch (currentPage) {
      case 'user-dashboard':
        return <AIWritingAssistant onNavigateBack={() => handlePageChange('user-dashboard')} />;
      case 'ai-writer':
        return <AIWritingAssistant onNavigateBack={() => handlePageChange('user-dashboard')} />;
      case 'checkout':
        return <CheckoutPage onNavigateBack={handlePageChange} />;
      case 'documents':
        return <PagePlaceholder title="My Documents" description="View and manage your saved documents" />;
      case 'settings':
        return <PagePlaceholder title="Account Settings" description="Manage your account preferences" />;
      case 'history':
        return <PagePlaceholder title="Writing History" description="View your past writing sessions" />;
      default:
        return <AIWritingAssistant onNavigateBack={() => handlePageChange('user-dashboard')} />;
    }
  };

  if (user?.role === 'admin') {
    return (
      <Elements stripe={stripePromise}>
        <div className="App">
          <Layout
            currentPage={currentPage}
            onPageChange={handlePageChange}
            user={user}
          >
            {renderAdminPage()}
          </Layout>
        </div>
      </Elements>
    );
  } else {
    return (
      <Elements stripe={stripePromise}>
        <div className="App">
          {renderUserPage()}
        </div>
      </Elements>
    );
  }
};

export default App;
