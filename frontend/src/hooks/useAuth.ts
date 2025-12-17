import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const router = useRouter();
  const isMounted = useRef(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await authAPI.getProfile();
      if (isMounted.current) {
        setUser(response.data);
      }
    } catch (err) {
      if (isMounted.current) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchProfile]);

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