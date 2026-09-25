import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/chat');
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-indigo-100">Sign in to continue to ScholarSetu</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8">
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">Select your role</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center transition-all ${
                role === 'student' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}>
                <input type="radio" name="role" value="student" className="hidden" 
                  checked={role === 'student'} onChange={() => setRole('student')} />
                <User className={`w-8 h-8 mb-2 ${role === 'student' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${role === 'student' ? 'text-indigo-800' : 'text-gray-600'}`}>Student</span>
              </label>
              
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center transition-all ${
                role === 'admin' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}>
                <input type="radio" name="role" value="admin" className="hidden" 
                  checked={role === 'admin'} onChange={() => setRole('admin')} />
                <ShieldCheck className={`w-8 h-8 mb-2 ${role === 'admin' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${role === 'admin' ? 'text-indigo-800' : 'text-gray-600'}`}>Admin</span>
              </label>
            </div>
          </div>
          
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
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
