import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1: Role, 2: Student Action (New/Old), 3: Credentials Form
  const [role, setRole] = useState('student');
  const [studentAction, setStudentAction] = useState('login'); // 'login' or 'register'
  const navigate = useNavigate();

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (role === 'admin') {
        setStep(3); // Admins go straight to login
      } else {
        setStep(2); // Students choose New/Old
      }
    }
  };

  const handleStudentActionSelection = (action) => {
    setStudentAction(action);
    setStep(3);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (role === 'admin') {
      navigate('/admin');
    } else {
      if (studentAction === 'register') {
        navigate('/chat');
      } else {
        navigate('/track');
      }
    }
  };
  
  const handleGmailLogin = () => {
    if (role === 'admin') navigate('/admin');
    else if (studentAction === 'register') navigate('/chat');
    else navigate('/track');
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden relative">
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="absolute top-6 left-4 text-white hover:text-indigo-200 transition z-10"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        
        <div className="bg-indigo-600 p-6 text-center text-white relative">
          <h2 className="text-3xl font-bold mb-2">Welcome</h2>
          <p className="text-indigo-100">
            {step === 1 ? 'Select your role to continue' : 
             step === 2 ? 'Are you a new or existing user?' : 
             studentAction === 'register' ? 'Register for ScholarSetu' : 'Sign in to your account'}
          </p>
        </div>
        
        <div className="p-8">
          {/* STEP 1: Select Role */}
          {step === 1 && (
            <form onSubmit={handleNextStep}>
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer border-2 rounded-xl p-6 flex flex-col items-center transition-all ${
                    role === 'student' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                  }`}>
                    <input type="radio" name="role" value="student" className="hidden" 
                      checked={role === 'student'} onChange={() => setRole('student')} />
                    <User className={`w-10 h-10 mb-3 ${role === 'student' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className={`font-semibold text-lg ${role === 'student' ? 'text-indigo-800' : 'text-gray-600'}`}>Student</span>
                  </label>
                  
                  <label className={`cursor-pointer border-2 rounded-xl p-6 flex flex-col items-center transition-all ${
                    role === 'admin' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                  }`}>
                    <input type="radio" name="role" value="admin" className="hidden" 
                      checked={role === 'admin'} onChange={() => setRole('admin')} />
                    <ShieldCheck className={`w-10 h-10 mb-3 ${role === 'admin' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className={`font-semibold text-lg ${role === 'admin' ? 'text-indigo-800' : 'text-gray-600'}`}>Admin</span>
                  </label>
                </div>
              </div>
              <button type="submit" 
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition duration-200 shadow-md">
                Continue
              </button>
            </form>
          )}

          {/* STEP 2: Student New/Old Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <button 
                onClick={() => handleStudentActionSelection('register')}
                className="w-full border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 rounded-xl p-5 flex items-center transition-all text-left"
              >
                <div className="bg-indigo-100 p-3 rounded-full mr-4 text-indigo-600">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">I am a New User</h3>
                  <p className="text-sm text-gray-500">Register and find scholarships</p>
                </div>
              </button>
              
              <button 
                onClick={() => handleStudentActionSelection('login')}
                className="w-full border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 rounded-xl p-5 flex items-center transition-all text-left"
              >
                <div className="bg-green-100 p-3 rounded-full mr-4 text-green-600">
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">I am an Existing User</h3>
                  <p className="text-sm text-gray-500">Login to track application</p>
                </div>
              </button>
            </div>
          )}

          {/* STEP 3: Credentials Form */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit}>
              {studentAction === 'register' && role !== 'admin' ? (
                <div className="mb-6 text-center">
                  <p className="text-gray-600 mb-6">
                    Registration is completed through our AI Chatbot. The bot will ask you for your details and documents step-by-step.
                  </p>
                  <button type="submit" 
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition duration-200 shadow-md">
                    Start AI Registration
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="userId">
                      {role === 'student' ? 'PAN Card / Samagra ID' : 'Admin ID / Email'}
                    </label>
                    <input 
                      id="userId"
                      type="text" 
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={role === 'student' ? 'e.g. ABCDE1234F' : 'admin@scholarsetu.gov'}
                    />
                  </div>

                  <div className="mb-8">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">
                      Password
                    </label>
                    <input 
                      id="password"
                      type="password" 
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <button type="submit" 
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition duration-200 shadow-md">
                    Sign In
                  </button>
                </>
              )}
              
              <div className="mt-6 flex items-center justify-center">
                <span className="h-px bg-gray-300 flex-1"></span>
                <span className="px-4 text-sm text-gray-500">OR</span>
                <span className="h-px bg-gray-300 flex-1"></span>
              </div>
              
              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    const decoded = jwtDecode(credentialResponse.credential);
                    console.log('Google User:', decoded);
                    // Same logic as before
                    if (role === 'admin') navigate('/admin');
                    else if (studentAction === 'register') navigate('/chat');
                    else navigate('/track');
                  }}
                  onError={() => {
                    console.error('Login Failed');
                  }}
                  text="continue_with"
                  width="100%"
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
