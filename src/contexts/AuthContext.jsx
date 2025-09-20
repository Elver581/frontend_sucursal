import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await authAPI.me();
        setUser(response.data);
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
     
      const { user, token } = response.data;
      
      localStorage.setItem('auth_token', token);
      console.log('Token almacenado:', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error.response?.data);
      return {
        success: false,
        errors: error.response?.data?.errors || {},
        message: error.response?.data?.message || 'Error al iniciar sesión',
        errorCode: error.response?.data?.error_code,
        data: error.response?.data?.data || null
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error.response?.data);
      return {
        success: false,
        errors: error.response?.data?.errors || {},
        error: error.response?.data?.message || 'Error al registrarse'
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
