import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-full max-w-md mx-auto my-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-600">OpenDesk</h1>
          <p className="text-gray-600 mt-2">Customer Support Platform</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
