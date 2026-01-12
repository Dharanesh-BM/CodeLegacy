import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { CheckSquare, Calendar, UtensilsCrossed, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatAgent from './ChatAgent';

export default function Layout() {
  const { currentUser, logout } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Today', icon: CheckSquare },
    { path: '/plan', label: 'Plan', icon: Calendar },
    { path: '/pantry', label: 'Food List', icon: UtensilsCrossed },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-0">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">SmartMeal AI</h1>
        <div className="flex items-center gap-3">
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName || 'User'} 
                className="w-8 h-8 rounded-full border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={18} />
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg z-50">
        <ul className="flex justify-around items-center h-16">
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path} className="w-full">
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center h-full w-full ${
                    isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                <Icon size={24} />
                <span className="text-xs mt-1">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <ChatAgent />
    </div>
  );
}
