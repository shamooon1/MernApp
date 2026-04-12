import React, { useState } from 'react';
import { 
  PenTool, 
  Users, 
  Building, 
  GraduationCap, 
  Briefcase, 
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Play,
  ChevronDown
} from 'lucide-react';

const SmartWriteHomepage = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLoginClick = () => {
    if (onNavigate) {
      onNavigate('login');
    }
  };

  const handleSignupClick = () => {
    if (onNavigate) {
      onNavigate('signup');
    }
  };

  const handleGetStarted = () => {
    if (onNavigate) {
      onNavigate('signup');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-white text-blue-600 p-2 rounded-lg">
                  <PenTool className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-semibold">SMARTWRITE</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-blue-100 hover:text-white">Home</a>
                <div className="relative group">
                  <button className="text-blue-100 hover:text-white flex items-center space-x-1">
                    <span>Subscriptions</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative group">
                  <button className="text-blue-100 hover:text-white flex items-center space-x-1">
                    <span>AI Tools</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <a href="#" className="text-blue-100 hover:text-white">Pricing</a>
                <a href="#" className="text-blue-100 hover:text-white">Help</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLoginClick}
                className="text-blue-100 hover:text-white px-3 py-2 rounded-lg hover:bg-blue-700"
              >
                Log in
              </button>
              <button
                onClick={handleSignupClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                Welcome to SMARTWRITE
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Every Word Counts — Let's Make
              <br />
              Yours Shine Brighter.
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Build new friendships with AI-based Suggestions For Grammar, Clarity, And Style — 
              Are One-Click
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-medium text-lg inline-flex items-center space-x-2"
            >
              <span>Try it</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Everyone
            </h2>
          </div>

          {/* App Screenshot */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-blue-100 rounded-2xl p-8 border-4 border-blue-200">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Mock App Interface */}
                <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PenTool className="h-5 w-5" />
                    <span className="font-semibold">SMARTWRITE</span>
                  </div>
                  <div className="text-sm">Welcome to SMARTWRITE</div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-100 rounded"></div>
                      <div className="h-4 bg-gray-100 rounded"></div>
                    </div>
                    <div className="col-span-6">
                      <div className="border rounded-lg p-4">
                        <div className="h-32 bg-gray-50 rounded mb-4"></div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded">
                          Generate
                        </button>
                      </div>
                    </div>
                    <div className="col-span-3 space-y-2">
                      <div className="h-4 bg-green-100 rounded"></div>
                      <div className="h-4 bg-blue-100 rounded"></div>
                      <div className="h-4 bg-purple-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Categories */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Multilingual Users</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Students</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Professionals</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Businesses</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Youtubers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Yet Smart Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Simple Yet Smart
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Log in to Sign in to Your Account</h3>
                    <p className="text-gray-600 mt-1">Access all your documents and AI tools instantly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <PenTool className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Write with AI Assistance</h3>
                    <p className="text-gray-600 mt-1">Get real-time suggestions for grammar, style, and clarity</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Star className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Improve Your Writing</h3>
                    <p className="text-gray-600 mt-1">Transform your ideas into polished, professional content</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Mobile App Mockup */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm mx-auto">
                <div className="bg-blue-600 text-white rounded-t-2xl p-4 -m-6 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PenTool className="h-4 w-4" />
                      <span className="text-sm font-semibold">SMARTWRITE</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">Welcome back</h3>
                    <p className="text-sm text-gray-600">Continue writing</p>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
                      Sign in
                    </button>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className="h-px bg-gray-300 flex-1"></div>
                      <span>or</span>
                      <div className="h-px bg-gray-300 flex-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              {/* App Interface Mockup */}
              <div className="bg-blue-50 rounded-2xl p-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Document Editor</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="border rounded p-4 mb-4 h-32 bg-gray-50"></div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 words</span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs">
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Make the wise decision 
                <br />
                for your business
              </h2>
              <p className="text-gray-600 mb-8">
                Over 30 million people and businesses use SmartWrite to communicate more effectively every day.
              </p>
              
              {/* CTA Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium inline-flex items-center justify-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="text-sm text-gray-500">
                  No credit card required
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-blue-100">
                <li>Essay writing</li>
                <li>Applications</li>
                <li>Letters</li>
                <li>Cover Letter</li>
                <li>Resumes</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-blue-100">
                <li>Google chrome</li>
                <li>Blogs</li>
                <li>Wikipedia</li>
                <li>Roadmap</li>
                <li>Feedback</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Comparison</h3>
              <ul className="space-y-2 text-blue-100">
                <li>Jasper</li>
                <li>Copy AI</li>
                <li>Writesonic</li>
                <li>Rytr</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Developers</h3>
              <ul className="space-y-2 text-blue-100">
                <li>About us</li>
                <li>Customer's love</li>
                <li>Contact us</li>
                <li>Affiliate Program</li>
                <li>Careers</li>
                <li>Pricing</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-500 mt-8 pt-8 text-center text-blue-100">
            <p>&copy; 2024 SmartWrite. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SmartWriteHomepage;