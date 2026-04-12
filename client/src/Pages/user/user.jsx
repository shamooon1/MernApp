import React, { useState, useEffect, useRef } from 'react';
import PricingPage from '../payment/payment.jsx'; // Import the pricing page

import { getCurrentUser, logout, apiRequest, isAuthenticated } from '../../services/AuthService.js';
import { 
  Save, 
  Download, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  Globe, 
  Wand2,
  Copy,
  Trash2,
  User,
  LogOut,
  PenTool,
  Plus,
  Zap,
  MessageSquare,
  BookOpen,
  Mail,
  FileCheck
} from 'lucide-react';
import { analytics } from '../../utils/analytics.js';

const AIWritingAssistant = ({ onNavigateBack }) => {
  // Add a state for page navigation within the user interface
  const [currentPage, setCurrentPage] = useState('editor'); // 'editor' | 'pricing'
  
  // State management
  const [user, setUser] = useState(null);
  const [currentDocument, setCurrentDocument] = useState({
    id: Date.now(),
    title: 'Untitled Document',
    content: '',
    lastModified: new Date()
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTone, setSelectedTone] = useState('neutral');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const editorRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Initialize user data and check authentication
  useEffect(() => {
    const initializeApp = () => {
      if (!isAuthenticated()) {
        if (onNavigateBack) {
          onNavigateBack('login');
        }
        return;
      }

      const userData = getCurrentUser();
      setUser(userData);
      setLoading(false);
    };

    initializeApp();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    
    autoSaveRef.current = setTimeout(() => {
      if (currentDocument.content && user) {
        saveDocument();
      }
    }, 3000);

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [currentDocument.content, currentDocument.title]);

  // Update word count
  useEffect(() => {
    const words = currentDocument.content.trim() === '' ? 0 : currentDocument.content.trim().split(/\s+/).length;
    const chars = currentDocument.content.length;
    setWordCount(words);
    setCharCount(chars);
  }, [currentDocument.content]);

  // Templates
  const templates = [
    { 
      id: 'essay', 
      name: 'Essay writing', 
      icon: <BookOpen className="h-5 w-5" />,
      content: 'Introduction\n\nMain Body\n\nConclusion'
    },
    { 
      id: 'applications', 
      name: 'Applications', 
      icon: <FileCheck className="h-5 w-5" />,
      content: 'Dear Hiring Manager,\n\nI am writing to apply for...'
    },
    { 
      id: 'letters', 
      name: 'Letters', 
      icon: <Mail className="h-5 w-5" />,
      content: 'Dear [Name],\n\nI hope this letter finds you well...'
    },
    { 
      id: 'cover-letter', 
      name: 'Cover Letter', 
      icon: <FileText className="h-5 w-5" />,
      content: 'Dear [Hiring Manager],\n\nI am excited to apply for the position of...'
    },
    { 
      id: 'resumes', 
      name: 'Resumes', 
      icon: <User className="h-5 w-5" />,
      content: '[Your Name]\n[Your Contact Information]\n\nObjective:\n\nExperience:\n\nEducation:'
    }
  ];

  // AI Tools
  const aiTools = [
    { 
      id: 'grammar', 
      name: 'Grammar and mistakes', 
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    { 
      id: 'tone', 
      name: 'Tone & clarity mistakes', 
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    { 
      id: 'summarize', 
      name: 'Summarize & simplify', 
      icon: <FileText className="h-5 w-5" />,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    { 
      id: 'clarity', 
      name: 'Clarity Enhancements', 
      icon: <Zap className="h-5 w-5" />,
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    { 
      id: 'plagiarism', 
      name: 'Plagiarism Check', 
      icon: <FileCheck className="h-5 w-5" />,
      color: 'text-red-600 bg-red-50 border-red-200'
    }
  ];

  // AI Processing function
  const applySuggestion = (text) => {
    setCurrentDocument(prev => ({
      ...prev,
      content: text,
      lastModified: new Date()
    }));
  };

const downloadDocument = () => {
  const blob = new Blob([currentDocument.content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${currentDocument.title || "document"}.txt`;
  link.click();
};


  const processAI = async (action = 'generate') => {
    const type = action; // 'generate' | 'grammar' | 'tone' | 'summarize' | etc.
    const prompt = currentDocument.content || '';

    // Track feature usage
    analytics.trackFeatureUsage(type, 'ai_tool');

    if (!prompt.trim()) {
      setSuggestions(prev => [...prev, { 
        id: Date.now(), 
        type: 'error', 
        text: 'Please enter some text first', 
        timestamp: new Date() 
      }]);
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Sending request:', { prompt: prompt.substring(0, 100), type });
      
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prompt,                // send the editor content
          type,                  // send the action as type
          toolName: type === 'generate' ? 'Content Gen' : 'Content Improve',
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is ok first
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get response as text first to debug
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Check if response is empty
      if (!responseText) {
        throw new Error('Empty response from server');
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'AI processing failed');
      }

      const newSuggestion = { 
        id: Date.now(), 
        type, 
        text: data.response, 
        timestamp: new Date() 
      };
      setSuggestions(prev => [...prev, newSuggestion]);

    } catch (error) {
      analytics.endFeatureUsage?.();
      console.error('AI processing error:', error);
      setSuggestions(prev => [...prev, { 
        id: Date.now(), 
        type: 'error', 
        text: `Error: ${error.message}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };


  // Create a new document (used by "New post" button)
  const createNewDocument = () => {
    const newDoc = {
      id: Date.now(),
      title: 'Untitled Document',
      content: '',
      lastModified: new Date()
    };
    setCurrentDocument(newDoc);
    setSelectedTemplate('');
    setSuggestions([]);
    // focus the editor (textarea)
    setTimeout(() => {
      editorRef.current?.focus?.();
    }, 50);
  };

  const saveDocument = async () => {
    // Mock save functionality
    setCurrentDocument(prev => ({ ...prev, lastModified: new Date() }));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      if (onNavigateBack) {
        onNavigateBack('login');
      }
    }
  };

  const loadTemplate = (template) => {
    setCurrentDocument(prev => ({
      ...prev,
      content: template.content,
      title: `${template.name} - ${new Date().toLocaleDateString()}`
    }));
    setSelectedTemplate(template.id);
  };

  // Add this function to handle internal page navigation
  const handlePageNavigation = (page) => {
    setCurrentPage(page);
  };

  // If on pricing page, show the pricing component
  if (currentPage === 'pricing') {
    return (
      <PricingPage 
        onNavigateBack={(targetPage) => {
          if (targetPage === 'user-dashboard') {
            setCurrentPage('editor'); // Stay in user interface but go back to editor
          } else {
            onNavigateBack(targetPage); // Navigate to other parts of the app
          }
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading SmartWrite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <PenTool className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-semibold text-white">SMARTWRITE</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <button 
                  onClick={() => setCurrentPage('editor')}
                  className="text-white hover:text-gray-200"
                >
                  Home
                </button>
                <button 
                  onClick={() => setCurrentPage('pricing')}
                  className="text-white hover:text-gray-200"
                >
                  Pricing
                </button>
                <a href="#" className="text-white hover:text-gray-200">AI Tools</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
                <div className="bg-orange-500 text-white p-1 rounded-full">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium text-orange-800">{user?.name || 'Vanessa'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="col-span-3">
            {/* Quick Start */}
            

<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
  <button
    type="button"
    onClick={createNewDocument}
    className="w-full flex items-center space-x-2 mb-4 rounded-lg px-2 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label="Create new post"
  >
    <div className="bg-green-100 p-2 rounded">
      <Plus className="h-4 w-4 text-green-600" />
    </div>
    <span className="text-sm font-medium text-gray-700">New post</span>
  </button>
  <div className="space-y-2 text-sm text-gray-600">
    <div>History</div>
    <div>Collections</div>
    <div>Trash</div>
  </div>
</div>

            {/* Welcome Section */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Bonus</h3>
              <div className="space-y-3">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template)}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left text-sm transition-colors ${
                      selectedTemplate === template.id 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'hover:bg-blue-100 text-gray-700'
                    }`}
                  >
                    {template.icon}
                    <span>{template.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Info - Updated to show pricing button */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-600 mb-2">Free Plan</div>
              <div className="text-xs text-gray-500">{wordCount.toLocaleString()} words</div>
              <div className="space-y-2 text-xs text-gray-500 mt-4">
                <button
                  onClick={() => setCurrentPage('pricing')}
                  className="block w-full text-left hover:text-blue-600"
                >
                  Upgrade
                </button>
                <div>Public Profile</div>
                <div>Help</div>
                <div>Settings</div>
                <div onClick={handleLogout} className="cursor-pointer hover:text-red-600">Log out</div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-6">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to <span className="text-blue-600">SMARTWRITE</span>
              </h1>
              <p className="text-gray-600 mb-4">A bot that can edit, help with grammar and flow</p>
              <p className="text-gray-700 font-medium mb-6">What are you looking to create?</p>
            </div>

            {/* Main Editor */}
            <div className="bg-white rounded-lg shadow-sm">
              {/* Editor Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <input
                  type="text"
                  value={currentDocument.title}
                  onChange={(e) => setCurrentDocument(prev => ({ ...prev, title: e.target.value }))}
                  className="text-lg font-medium border-none outline-none bg-transparent flex-1"
                  placeholder="Document title"
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={saveDocument}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Save"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                   onClick={downloadDocument}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
               title="Download"
         >
  <Download className="h-4 w-4" />
</button>

                </div>
              </div>

              {/* Editor */}
              <div className="p-6">
                <textarea
                  ref={editorRef}
                  value={currentDocument.content}
                  onChange={(e) => setCurrentDocument(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe..."
                  className="w-full h-64 border-none outline-none resize-none text-gray-900 leading-relaxed text-lg"
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter') {
                      e.preventDefault();
                      processAI('generate'); // Ctrl+Enter to generate
                    }
                  }}
                />
              </div>

              {/* Editor Footer */}
              <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{wordCount} words</span>
                  <span>{charCount} characters</span>
                </div>
                <button
                  onClick={() => processAI('generate')}
                  disabled={isProcessing || !currentDocument.content.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - AI Tools */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Tools</h3>
              <div className="space-y-3">
                {aiTools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => processAI(tool.id)}
                    disabled={isProcessing}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${tool.color} hover:shadow-sm disabled:opacity-50`}
                  >
                    {tool.icon}
                    <span className="text-sm font-medium">{tool.name}</span>
                    {isProcessing && <RefreshCw className="h-4 w-4 animate-spin ml-auto" />}
                  </button>
                ))}
              </div>

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Suggestions</h4>
                  <div className="space-y-2">
                    {suggestions.slice(-3).map((suggestion, index) => (
                      <div key={suggestion.id} className="p-3 bg-gray-50 rounded border text-xs">
                        <div className="font-medium text-gray-700 uppercase tracking-wide mb-1">
                          {suggestion.type}
                        </div>
                        <div className="text-gray-600">{suggestion.text}</div>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => applySuggestion(suggestion.text)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                          >
                            Apply
                          </button>
                          <button 
                            onClick={() => navigator.clipboard.writeText(suggestion.text)}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWritingAssistant;