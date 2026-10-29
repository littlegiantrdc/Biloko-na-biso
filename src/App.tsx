import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProducersPage } from './pages/ProducersPage';
import { ProducerPublicProfilePage } from './pages/ProducerPublicProfilePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { StoriesPage, ArticleDetailPage } from './pages/StoriesPage';
import { AboutPage, ContactPage } from './pages/AboutPage';
import { FAQPage, PublicationGuidelinesPage, TermsPage, PrivacyPage } from './pages/LegalPages';
import {
  LoginPage,
  RegisterMemberPage,
  RegisterProducerPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './pages/AuthPages';
import { MemberProfilePage } from './pages/MemberProfilePage';
import { ProducerDashboard } from './pages/ProducerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    function onPopState() {
      setCurrentPath(window.location.pathname || '/');
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigate(path: string) {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  }

  // Routing logic
  function renderView() {
    const url = new URL(window.location.href);
    const pathname = currentPath.split('?')[0];

    if (pathname === '/') {
      return <HomePage navigate={navigate} />;
    }

    if (pathname === '/catalogue') {
      const search = url.searchParams.get('search') || '';
      const category = url.searchParams.get('category') || 'all';
      const province = url.searchParams.get('province') || 'all';
      return (
        <CatalogPage
          navigate={navigate}
          initialSearch={search}
          initialCategory={category}
          initialProvince={province}
        />
      );
    }

    if (pathname.startsWith('/produit/')) {
      const idOrSlug = pathname.replace('/produit/', '');
      return <ProductDetailPage productIdOrSlug={idOrSlug} navigate={navigate} />;
    }

    if (pathname === '/producteurs') {
      return <ProducersPage navigate={navigate} />;
    }

    if (pathname.startsWith('/producteurs/')) {
      const slugOrId = pathname.replace('/producteurs/', '');
      return <ProducerPublicProfilePage slugOrId={slugOrId} navigate={navigate} />;
    }

    if (pathname === '/categories') {
      return <CategoriesPage navigate={navigate} />;
    }

    if (pathname === '/histoires') {
      return <StoriesPage navigate={navigate} />;
    }

    if (pathname.startsWith('/histoires/')) {
      const slug = pathname.replace('/histoires/', '');
      return <ArticleDetailPage slug={slug} navigate={navigate} />;
    }

    if (pathname === '/a-propos') {
      return <AboutPage navigate={navigate} />;
    }

    if (pathname === '/contact') {
      return <ContactPage />;
    }

    if (pathname === '/faq') {
      return <FAQPage />;
    }

    if (pathname === '/regles-publication') {
      return <PublicationGuidelinesPage />;
    }

    if (pathname === '/conditions-utilisation') {
      return <TermsPage />;
    }

    if (pathname === '/politique-confidentialite') {
      return <PrivacyPage />;
    }

    if (pathname === '/connexion') {
      return <LoginPage navigate={navigate} />;
    }

    if (pathname === '/inscription') {
      return <RegisterMemberPage navigate={navigate} />;
    }

    if (pathname === '/inscription-producteur') {
      return <RegisterProducerPage navigate={navigate} />;
    }

    if (pathname === '/mot-de-passe-oublie') {
      return <ForgotPasswordPage navigate={navigate} />;
    }

    if (pathname === '/reinitialiser-mot-de-passe') {
      return <ResetPasswordPage navigate={navigate} />;
    }

    if (pathname === '/mon-compte') {
      const tab = url.searchParams.get('tab') || 'profil';
      return <MemberProfilePage navigate={navigate} initialTab={tab} />;
    }

    if (pathname === '/producteur/dashboard') {
      return <ProducerDashboard navigate={navigate} />;
    }

    if (pathname === '/admin') {
      return <AdminDashboard navigate={navigate} />;
    }

    // 404 Fallback
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-4xl font-black text-stone-900 font-display">Page non trouvée (404)</h1>
        <p className="text-xs text-stone-500">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
        >
          Retourner à l'accueil
        </button>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-700 selection:text-white">
        <Header currentPath={currentPath} navigate={navigate} />
        <main className="flex-grow">{renderView()}</main>
        <Footer navigate={navigate} />
      </div>
    </AuthProvider>
  );
}

export default App;
