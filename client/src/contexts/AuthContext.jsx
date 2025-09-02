// client/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add these console logs for debugging:
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('Auth check - Token found:', !!token);

      if (token) {
        try {
          console.log('Attempting to fetch user data...');
          const userData = await authAPI.getCurrentUser();
          console.log('User data fetched:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
      console.log('Auth check completed');
    };

    checkAuth();
  }, []);

const login = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.data.user); 
    window.location.reload();
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Login failed' };
  }
};

const signup = async (userData) => {
  try {
    const response = await authAPI.signup(userData);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.data.user);
    window.location.reload();
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Signup failed' };
  }
};


  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};