import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; name: string; phone: string; city: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      setUser(response.data.user);
      setTimeout(() => router.push('/'), 100);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login({ email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      setUser(response.data.user);
      setTimeout(() => router.push('/'), 100);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
    router.push('/');
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };
};

export default useAuth;