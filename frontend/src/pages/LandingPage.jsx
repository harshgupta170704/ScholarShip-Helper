import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, CheckCircle, Search, Shield, Zap, BookOpen } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">ScholarSetu</h1>
          <p className="text-xl md:text-2xl mb-10 text-indigo-100">Your AI-Powered Scholarship Assistant</p>
          <Link 
            to="/login" 
            className="inline-flex items-center bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-indigo-50 transition-colors"
          >
            Login to Start <MessageSquare className="ml-2 w-5 h-5" />
          </Link>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-sm text-indigo-100">Scholarships</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">10+</div>
              <div className="text-sm text-indigo-100">MP Schemes</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-xl font-bold mb-1">AI-Powered</div>
              <div className="text-sm text-indigo-100">OCR</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-xl font-bold mb-1">Real-time</div>
              <div className="text-sm text-indigo-100">Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Chat with Bot</h3>
              <p className="text-gray-600">Answer simple questions about your profile, education, and background in your preferred language.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Upload Documents</h3>
              <p className="text-gray-600">Securely upload your documents. Our AI extracts and verifies details instantly using OCR.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Get Recommendations</h3>
              <p className="text-gray-600">Receive matched scholarships and apply seamlessly with your verified profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <MessageSquare className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">AI Chatbot</h3>
              <p className="text-gray-600">Conversational interface that guides you step-by-step through the application process.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <Shield className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">OCR Verification</h3>
              <p className="text-gray-600">Automatic extraction and verification of data from Aadhar, PAN, and marksheets.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <Zap className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Scholarship Matching</h3>
              <p className="text-gray-600">Smart algorithm that matches you with eligible schemes based on your profile.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <CheckCircle className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Duplicate Detection</h3>
              <p className="text-gray-600">Prevents fraudulent applications by detecting duplicate profiles and documents.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <BookOpen className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">MP-Specific Schemes</h3>
              <p className="text-gray-600">Deep integration with Madhya Pradesh state scholarship schemes and criteria.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <Search className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Multi-language</h3>
              <p className="text-gray-600">Support for English and Hindi to reach every student in the state.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="text-2xl font-bold text-white flex items-center">
              ScholarSetu
            </span>
            <p className="mt-2 text-sm">Empowering students with AI-driven scholarship access.</p>
          </div>
          <div className="flex gap-8 text-sm">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2">
                <span className="text-xs text-black font-bold">Digital<br/>India</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2">
                <span className="text-xs text-black font-bold">Viksit<br/>Bharat</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {new Date().getFullYear()} ScholarSetu. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
