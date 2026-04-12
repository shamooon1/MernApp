import React, { useState, useEffect } from 'react';
import { CreditCard, User, ChevronDown, Lock, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Replace with your Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SBLpTEbZh8Zw6WJrWmFYLDQ38b4jEbBwcja2Itz7NtLfWS0rb1DpqTJlc2QQQzTjhFP9LEOgMFlSSl2dIQUorrv00S7pVUAdN');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

// Add ISO country list
const COUNTRIES = [
  { code: 'PK', name: 'Pakistan' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
];

const CheckoutForm = ({ amount, planName, onBack, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: 'PK', 
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentLoading, setPaymentIntentLoading] = useState(false);

  useEffect(() => {
    if (amount && paymentMethod === 'card') {
      createPaymentIntent();
    }
  }, [amount]);

  const createPaymentIntent = async () => {
    setPaymentIntentLoading(true);
    setError(null);
    
    try {
      console.log('Creating payment intent for amount:', amount);
      
      const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ADD THIS LINE - it was missing!
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: 'usd',
          metadata: {
            planName: planName,
            firstName: formData.firstName,
            lastName: formData.lastName,
            countryCode: (formData.country || '').toUpperCase(),
          }
        })
      });

      console.log('Payment intent response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment intent creation failed:', errorText);
        throw new Error(`Failed to create payment intent: ${response.status}`);
      }

      const data = await response.json();
      console.log('Payment intent data:', data);
      
      if (!data.clientSecret) {
        throw new Error('No client secret received from server');
      }
      
      setClientSecret(data.clientSecret);
      
    } catch (err) {
      console.error('Payment Intent Error:', err);
      setError(`Failed to initialize payment: ${err.message}`);
    } finally {
      setPaymentIntentLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait a moment and try again.');
      return;
    }

    if (!clientSecret) {
      setError('Payment not initialized. Please refresh the page and try again.');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.country) {
      setError('Please fill in all billing information');
      return;
    }

    if (!/^[A-Z]{2}$/.test((formData.country || '').toUpperCase())) {
      setError('Please select a valid country');
      return;
    }

    if (paymentMethod === 'card') {
      setLoading(true);
      setError(null);

      try {
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
          throw new Error('Card element not found');
        }

        console.log('Confirming payment with client secret:', clientSecret);

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${formData.firstName} ${formData.lastName}`,
                address: {
                  country: (formData.country || '').toUpperCase(),
                }
              }
            }
          }
        );

        if (stripeError) {
          console.error('Stripe error:', stripeError);
          setError(stripeError.message);
          setLoading(false);
        } else if (paymentIntent.status === 'succeeded') {
          console.log('Payment succeeded:', paymentIntent);
          setSucceeded(true);
          setLoading(false);
          
          await saveSubscription(paymentIntent);
          
          setTimeout(() => {
            if (onSuccess) {
              onSuccess(paymentIntent);
            }
          }, 2000);
        }
      } catch (err) {
        console.error('Payment Error:', err);
        setError(`Payment failed: ${err.message}`);
        setLoading(false);
      }
    } else if (paymentMethod === 'paypal') {
      alert('PayPal integration coming soon!');
    } else if (paymentMethod === 'wallet') {
      alert('Wallet integration coming soon!');
    }
  };

  // Also fix the saveSubscription function
  const saveSubscription = async (paymentIntent) => {
    try {
      const response = await fetch('http://localhost:5000/api/payments/confirm-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ADD THIS LINE
        body: JSON.stringify({
          userId: 'current_user_id',
          planName: planName,
          amount: amount,
          paymentIntentId: paymentIntent.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          country: formData.country
        })
      });

      if (!response.ok) {
        console.error('Failed to save subscription');
      }
    } catch (err) {
      console.error('Error saving subscription:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-white text-blue-600 p-2 rounded-lg">
                  <User className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-semibold">SMARTWRITE</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
              <div className="bg-orange-500 text-white p-1 rounded-full">
                <User className="h-3 w-3" />
              </div>
              <span className="text-sm font-medium text-orange-800"></span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">All fields are required</p>
            {planName && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Selected Plan:</p>
                <p className="text-xl font-bold text-blue-600">{planName}</p>
                <p className="text-2xl font-bold text-gray-900">${amount}/month</p>
              </div>
            )}
            
            {/* Payment Intent Loading Indicator */}
            {paymentIntentLoading && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">Initializing payment...</p>
              </div>
            )}
          </div>

          {/* Billing Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <div className="relative">
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    {COUNTRIES.map(({ code, name }) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
            
            <div className="border border-gray-300 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-4">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="card" className="ml-2 flex items-center space-x-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">Card (Stripe)</span>
                </label>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Information *
                    </label>
                    <div className="p-3 border border-gray-300 rounded-md bg-white">
                      <CardElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Lock className="h-3 w-3" />
                    <p>
                      Your payment information is secure and encrypted.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {succeeded && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">
                Payment successful! Redirecting to dashboard...
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !stripe || succeeded || !clientSecret || paymentIntentLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing Payment...</span>
              </div>
            ) : succeeded ? (
              'Payment Successful!'
            ) : paymentIntentLoading ? (
              'Initializing...'
            ) : !clientSecret ? (
              'Payment Not Ready'
            ) : (
              `Pay $${amount}`
            )}
          </button>

          <p className="text-xs text-center text-gray-500 mt-4">
            Powered by Stripe • Secure Payment Processing
          </p>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = ({ amount, planName, onBack, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        amount={amount} 
        planName={planName} 
        onBack={onBack}
        onSuccess={onSuccess}
      />
    </Elements>
  );
};

export default CheckoutPage;