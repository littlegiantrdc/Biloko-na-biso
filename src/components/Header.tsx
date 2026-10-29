import React, { useState } from 'react';
import {
  Menu,
  X,
  Heart,
  User as UserIcon,
  Store,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export function Header({ currentPath, navigate }: HeaderProps) {
  const { user, favorites, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Découvrir les produits', path: '/catalogue' },
    { label: 'Producteurs', path: '/producteurs' },
    { label: 'Catégories', path: '/categories' },
    { label: 'Histoires & Savoir-faire', path: '/histoires' },
    { label: 'À propos', path: '/a-propos' },
    { label: 'Contact', path: '/contact' },
  ];

  function handleNavigate(path: string) {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity (Clean cutout, no green framing box) */}
          <button
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
            aria-label="Biloko Na Biso Accueil"
          >
            <img
              src="/logo-transparent.png"
              alt="Logo Biloko Na Biso"
              className="h-14 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-2xl font-black tracking-tight text-emerald-950 font-display">
                  BILOKO
                </span>
                <span className="text-2xl font-black tracking-tight text-amber-600 font-display">
                  NA BISO
                </span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 mt-1 hidden sm:block">
                Le savoir-faire congolais, à portée du monde
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavigate(link.path)}
                  className={`px-3 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'text-emerald-900 bg-emerald-50/80 font-bold border border-emerald-200/50'
                      : 'text-stone-700 hover:text-emerald-800 hover:bg-stone-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-3">
            {/* Favorites Icon */}
            {user && (
              <button
                onClick={() => handleNavigate('/mon-compte?tab=favoris')}
                className="relative p-2.5 rounded-xl text-stone-600 hover:text-rose-600 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Mes Favoris"
                aria-label="Voir mes favoris"
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
            )}

            {/* User Account / Login State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-stone-200 hover:border-emerald-300 bg-stone-50/70 hover:bg-white text-sm font-medium transition-all cursor-pointer"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-900 line-clamp-1 max-w-[120px]">
                      {user.fullName}
                    </p>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
                      {user.role === 'admin' ? 'Administrateur' : user.role === 'producer' ? 'Producteur' : 'Membre'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-500">Connecté en tant que</p>
                      <p className="text-sm font-bold text-stone-900 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNavigate('/mon-compte')}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-emerald-700" />
                        Mon compte membre
                      </button>

                      <button
                        onClick={() => handleNavigate('/mon-compte?tab=favoris')}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-rose-600" />
                        Mes produits favoris ({favorites.length})
                      </button>

                      {user.role === 'producer' && (
                        <button
                          onClick={() => handleNavigate('/producteur/dashboard')}
                          className="w-full text-left px-4 py-2 text-sm text-emerald-800 font-bold hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Store className="w-4 h-4 text-emerald-700" />
                          Espace Producteur
                        </button>
                      )}

                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleNavigate('/admin')}
                          className="w-full text-left px-4 py-2 text-sm text-indigo-900 font-bold hover:bg-indigo-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldAlert className="w-4 h-4 text-indigo-700" />
                          Panneau Administration
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-stone-100">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigate('/connexion')}
                  className="px-4 py-2.5 text-sm font-semibold text-stone-700 hover:text-emerald-800 hover:bg-stone-100 rounded-xl transition-all cursor-pointer"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => handleNavigate('/inscription-producteur')}
                  className="px-4 py-2.5 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-xs hover:shadow-md rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Devenir producteur
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            {user && (
              <button
                onClick={() => handleNavigate('/mon-compte?tab=favoris')}
                className="p-2 text-stone-600 hover:text-rose-600 cursor-pointer"
                aria-label="Favoris"
              >
                <Heart className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 focus:outline-none cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavigate(link.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-base font-semibold transition-colors cursor-pointer ${
                    isActive ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 bg-stone-50 rounded-xl mb-2">
                  <p className="text-xs text-stone-500">Connecté en tant que</p>
                  <p className="text-sm font-bold text-stone-900">{user.fullName}</p>
                  <span className="text-xs font-semibold text-emerald-700 uppercase">{user.role}</span>
                </div>

                <button
                  onClick={() => handleNavigate('/mon-compte')}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-emerald-700" />
                  Mon profil membre
                </button>

                {user.role === 'producer' && (
                  <button
                    onClick={() => handleNavigate('/producteur/dashboard')}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-emerald-700" />
                    Mon espace producteur
                  </button>
                )}

                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavigate('/admin')}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-indigo-700" />
                    Administration
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleNavigate('/connexion')}
                  className="w-full py-2.5 px-4 text-center text-sm font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => handleNavigate('/inscription-producteur')}
                  className="w-full py-2.5 px-4 text-center text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs cursor-pointer"
                >
                  Devenir producteur
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
