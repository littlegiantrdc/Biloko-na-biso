import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  favorites: string[];
  token: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerVisitor: (data: { fullName: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  registerProducer: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<boolean>;
  isFavorite: (productId: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('biloko_token'));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load current authenticated user on boot
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            fullName: data.user.full_name,
            phone: data.user.phone,
            avatarUrl: data.user.avatar_url,
            producerId: data.user.producer_id,
            producerCompany: data.user.producer_company,
            producerSlug: data.user.producer_slug,
            isVerified: Boolean(data.user.producer_verified),
          });
          // Fetch favorites
          fetchFavorites(token);
        } else {
          // Token expired or invalid
          localStorage.removeItem('biloko_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading session:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  async function fetchFavorites(authToken: string) {
    try {
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const favs = await res.json();
        setFavorites(favs.map((f: { id: string }) => f.id));
      }
    } catch {
      // ignore
    }
  }

  async function login(email: string, pass: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Identifiants invalides.' };
      }

      localStorage.setItem('biloko_token', data.token);
      setToken(data.token);
      setUser(data.user);
      fetchFavorites(data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erreur réseau lors de la connexion.' };
    }
  }

  async function registerVisitor(formData: { fullName: string; email: string; password: string; phone?: string }) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erreur lors de l’inscription.' };
      }

      localStorage.setItem('biloko_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Erreur réseau lors de l’inscription.' };
    }
  }

  async function registerProducer(formData: Record<string, unknown>) {
    try {
      const res = await fetch('/api/auth/register-producer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erreur lors de l’inscription producteur.' };
      }

      localStorage.setItem('biloko_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Erreur réseau lors de l’inscription.' };
    }
  }

  async function logout() {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    localStorage.removeItem('biloko_token');
    setToken(null);
    setUser(null);
    setFavorites([]);
  }

  async function toggleFavorite(productId: string): Promise<boolean> {
    if (!token) {
      return false;
    }
    try {
      const res = await fetch(`/api/favorites/${productId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.favorited) {
          setFavorites(prev => [...prev, productId]);
          return true;
        } else {
          setFavorites(prev => prev.filter(id => id !== productId));
          return false;
        }
      }
    } catch {
      // ignore
    }
    return false;
  }

  function isFavorite(productId: string) {
    return favorites.includes(productId);
  }

  async function refreshUser() {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          fullName: data.user.full_name,
          phone: data.user.phone,
          avatarUrl: data.user.avatar_url,
          producerId: data.user.producer_id,
          producerCompany: data.user.producer_company,
          producerSlug: data.user.producer_slug,
          isVerified: Boolean(data.user.producer_verified),
        });
      }
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        favorites,
        token,
        login,
        registerVisitor,
        registerProducer,
        logout,
        toggleFavorite,
        isFavorite,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
