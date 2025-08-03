import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthApi } from '../hooks/useAuthApi';

interface ProtectedRouteApiProps {
  children: React.ReactNode;
}

const ProtectedRouteApi: React.FC<ProtectedRouteApiProps> = ({ children }) => {
  const { currentUser, isLoading } = useAuthApi();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRouteApi;