import React, { useState, useEffect } from 'react';
import { User as UserIcon, Heart, Lock, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface MemberProfilePageProps {
  navigate: (path: string) => void;
  initialTab?: string;
}

export function MemberProfilePage({ navigate, initialTab = 'profil' }: MemberProfilePageProps) {
  const { user, refreshUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'profil' | 'favoris' | 'securite'>(
    initialTab === 'favoris' ? 'favoris' : 'profil'
  );

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [secMsg, setSecMsg] = useState<{ error?: string; success?: string } | null>(null);
  const [secLoading, setSecLoading] = useState(false);

  // Favorites
  const [favoritesList, setFavoritesList] = useState<Product[]>([]);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'favoris' && token) {
      fetchFavorites();
    }
  }, [activeTab, token]);

  async function fetchFavorites() {
    setFavLoading(true);
    try {
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavoritesList(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFavLoading(false);
    }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg('Informations mises à jour.');
        refreshUser();
      } else {
        setProfileMsg(data.error || 'Erreur.');
      }
    } catch {
      setProfileMsg('Erreur de connexion.');
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setSecLoading(true);
    setSecMsg(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSecMsg({ success: 'Mot de passe modifié avec succès.' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setSecMsg({ error: data.error || 'Erreur lors du changement de mot de passe.' });
      }
    } catch {
      setSecMsg({ error: 'Erreur réseau.' });
    } finally {
      setSecLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-stone-600">Vous devez être connecté pour accéder à cette page.</p>
        <button onClick={() => navigate('/connexion')} className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs">
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User greeting header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white font-black text-xl flex items-center justify-center shadow-md">
            {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
              {user.fullName}
            </h1>
            <p className="text-xs text-stone-500">{user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              {user.role === 'admin' ? 'Administrateur' : user.role === 'producer' ? 'Producteur certifié' : 'Membre Biloko'}
            </span>
          </div>
        </div>

        {user.role === 'producer' && (
          <button
            onClick={() => navigate('/producteur/dashboard')}
            className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors shadow-xs"
          >
            Accéder à mon espace producteur →
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('profil')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'profil' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          Mes informations
        </button>

        <button
          onClick={() => setActiveTab('favoris')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'favoris' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          Mes favoris
        </button>

        <button
          onClick={() => setActiveTab('securite')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'securite' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Sécurité & Mot de passe
        </button>
      </div>

      {/* Tab 1: Profile info */}
      {activeTab === 'profil' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs max-w-xl space-y-4">
          <h2 className="text-base font-bold text-stone-900 font-display">Modifier mes informations</h2>

          {profileMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Nom complet</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Adresse e-mail</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 text-xs cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">L'adresse e-mail principale ne peut être changée que sur demande écrite.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+243..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="py-2.5 px-5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors shadow-xs"
            >
              {profileLoading ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Favorites */}
      {activeTab === 'favoris' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 font-display">Mes produits enregistrés</h2>
            <span className="text-xs text-stone-500 font-semibold">{favoritesList.length} produit(s)</span>
          </div>

          {favLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 bg-stone-200 rounded-2xl" />
              ))}
            </div>
          ) : favoritesList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {favoritesList.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={(slug) => navigate(`/produit/${slug}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-2xs space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-600">Vous n'avez pas encore ajouté de produit à vos favoris.</p>
              <button
                onClick={() => navigate('/catalogue')}
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold"
              >
                Explorer le catalogue
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Security */}
      {activeTab === 'securite' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs max-w-xl space-y-4">
          <h2 className="text-base font-bold text-stone-900 font-display">Modifier mon mot de passe</h2>

          {secMsg?.error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">
              {secMsg.error}
            </div>
          )}
          {secMsg?.success && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
              {secMsg.success}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Mot de passe actuel</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Nouveau mot de passe (min 6 car.)</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={secLoading}
              className="py-2.5 px-5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors shadow-xs"
            >
              {secLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
