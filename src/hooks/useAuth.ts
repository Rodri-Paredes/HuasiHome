import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user,
    login,
    register,
    logout,
    error,
    clearError,
  } = context;

  return {
    user,
    login,
    register,
    logout,
    error,
    clearError,
  };
};
