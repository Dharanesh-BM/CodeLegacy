import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

export default function LoginPage() {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Failed to log in', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center mb-12">
        <div className="bg-blue-600 p-4 rounded-full mb-4">
          <ChefHat size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">SmartMeal AI</h1>
        <p className="text-gray-500 mt-1">Your personal meal planner</p>
      </div>

      <div className="w-full max-w-xs px-4">
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-5 h-5"
          />
          Sign in with Google
        </button>
      </div>
      
      <p className="mt-8 text-xs text-center text-gray-400 max-w-xs px-8">
        By signing in you agree to organize your meals efficiently and possibly eat healthier.
      </p>
    </div>
  );
}
