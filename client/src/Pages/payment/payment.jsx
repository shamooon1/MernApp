import React, { useState, useEffect } from 'react';
import CheckoutPage from './checkout.jsx';

const PricingPage = ({ onNavigateBack }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        const data = await response.json();
        setIsAuthenticated(data.success && data.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Please log in to access pricing</p>
        <button 
          onClick={() => onNavigateBack('login')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    </div>;
  }

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      period: '/Month',
      description: 'This package is suitable for teams 1-100 people',
      features: [
        '20 GB dedicated hosting free',
        'Best for developers, freelancer',
        '1 year support'
      ]
    },
    {
      id: 'standard',
      name: 'Monthly/Standard',
      price: 79,
      period: '/Month',
      description: 'This package is suitable for teams 1-100 people',
      features: [
        '15 GB dedicated hosting free',
        'Best for developers, freelancer',
        '5 year support',
        'Free customer domain',
        'Basic statistics'
      ],
      highlighted: true
    },
    {
      id: 'premium',
      name: 'Yearly Premium',
      price: 59,
      period: '/Month',
      description: 'This package is suitable for teams 1-100 people',
      features: [
        '20 GB dedicated hosting free',
        'Best for developers, freelancer',
        'Unlimited support',
        'Free customer domain',
        'Full statistics'
      ]
    }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    // Navigate back to dashboard or show success message
    if (onNavigateBack) {
      onNavigateBack('user-dashboard');
    }
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  // Show checkout form if a plan is selected
  if (showCheckout && selectedPlan) {
    return (
      <CheckoutPage 
        amount={selectedPlan.price}
        planName={selectedPlan.name}
        onBack={handlePaymentCancel}
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => onNavigateBack('user-dashboard')}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Make the wise decision
            <br />
            for your business
          </h1>
          <p className="text-gray-600 text-lg">
            Choose from our affordable 3 packages
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'border-2 border-blue-500 shadow-xl scale-105'
                  : 'border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg'
              }`}
            >
              {/* Plan Name */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-600 text-lg">{plan.period}</span>
              </div>

              {/* Description */}
              <p className="text-gray-500 text-sm mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">
                  What's included:
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-gray-600 text-sm">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Get started
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            All plans include 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;