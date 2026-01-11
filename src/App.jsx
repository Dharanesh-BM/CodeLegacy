import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initGoogleClient } from './services/googleAuth';
import Layout from './components/Layout';
import TodayPage from './pages/TodayPage';
import PlannerPage from './pages/PlannerPage';
import PantryPage from './pages/PantryPage';
import LoginPage from './pages/LoginPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  useEffect(() => {
    initGoogleClient();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<TodayPage />} />
            <Route path="plan" element={<PlannerPage />} />
            <Route path="pantry" element={<PantryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App


