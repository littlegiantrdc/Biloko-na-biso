import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  Calendar,
  Package,
  Eye,
  MessageCircle,
  Share2,
  Send,
  ArrowLeft,
  Globe,
  Star,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Producer } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ContactModal } from '../components/ContactModal';

interface ProducerPublicProfilePageProps {
  slugOrId: string;
  navigate: (path: string) => void;
}

export function ProducerPublicProfilePage({ slugOrId, navigate }: ProducerPublicProfilePageProps) {
  const [producer, setProducer] = useState<Producer | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch(`/api/producers/${slugOrId}`);
        if (res.ok) {
          setProducer(await res.json());
        } else {
          setProducer(null);
        }
      } catch (err) {
        console.error('Error fetching producer profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-64 bg-stone-200 rounded-3xl" />
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-stone-900 font-display">Producteur non trouvé</h2>
        <p className="text-sm text-stone-500">Ce profil n'existe pas ou a été désactivé.</p>
        <button
          onClick={() => navigate('/producteurs')}
          className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
        >
          Retour à l'annuaire
        </button>
      </div>
    );
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/producteurs')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'annuaire des producteurs
        </button>
      </div>

      {/* Hero Header & Brand Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md overflow-hidden">
        {/* Banner */}
        <div className="h-48 sm:h-64 w-full bg-linear-to-r from-emerald-950 via-teal-900 to-stone-900 relative">
          {producer.banner_url && (
            <img src={producer.banner_url} alt="" className="w-full h-full object-cover opacity-60" />
          )}
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 pb-8 pt-0 -mt-16 sm:-mt-20 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white p-1.5 border-4 border-white shadow-xl overflow-hidden shrink-0">
              <img
                src={producer.logo_url || 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=300&q=80'}
                alt={producer.company_name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {producer.sector}
                </span>
                {Boolean(producer.is_verified) ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-700 text-white shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Producteur vérifié
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-stone-500 bg-stone-100">
                    En cours de vérification
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                {producer.company_name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  {producer.city_territory}, Province du {producer.province}
                </span>
                {producer.founding_year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    Depuis {producer.founding_year}
                  </span>
                )}
                <span>Responsable : {producer.manager_name}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setContactModalOpen(true)}
              className="flex-grow sm:flex-grow-0 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Contacter l'entreprise
            </button>

            {producer.directWhatsAppUrl && (
              <a
                href={producer.directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
              title="Partager le profil"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Producer Story, Methods, and Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview description */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-3">
            <h2 className="text-lg font-bold text-stone-900 font-display">À propos de l'entreprise</h2>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {producer.description}
            </p>
          </div>

          {/* Story & Background */}
          {producer.story && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-3">
              <h2 className="text-lg font-bold text-stone-900 font-display">Histoire & Parcours</h2>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {producer.story}
              </p>
            </div>
          )}

          {/* Methods of production */}
          {producer.production_methods && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-3">
              <h2 className="text-lg font-bold text-stone-900 font-display">Méthodes de production & Savoir-faire</h2>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {producer.production_methods}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200/90 space-y-4">
            <h3 className="text-sm font-bold text-stone-900">Informations clés</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-stone-500">Produits au catalogue :</span>
                <span className="font-bold text-stone-900">{producer.product_count || 0}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-stone-500">Vente en gros (B2B) :</span>
                <span className="font-bold text-emerald-800">
                  {producer.accepts_wholesale ? 'Oui' : 'Non'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-stone-500">Réseau de distribution :</span>
                <span className="font-bold text-emerald-800">
                  {producer.accepts_distribution ? 'Recherche distributeurs' : 'Direct'}
                </span>
              </div>
              {producer.overallRating !== undefined && producer.overallRating > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-500">Note moyenne :</span>
                  <span className="font-bold text-stone-900 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {producer.overallRating.toFixed(1)} / 5
                  </span>
                </div>
              )}
            </div>

            {producer.website_url && (
              <div className="pt-2">
                <a
                  href={producer.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:text-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Site web officiel
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Published Products by this Producer */}
      <section className="space-y-6 pt-6 border-t border-stone-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
            Produits proposés par {producer.company_name}
          </h2>
          <p className="text-xs text-stone-500">
            {producer.products ? producer.products.length : 0} référence(s) disponible(s)
          </p>
        </div>

        {producer.products && producer.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {producer.products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={(slug) => navigate(`/produit/${slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-stone-50 rounded-2xl p-8 text-center text-xs text-stone-500">
            Aucun produit publié pour le moment par ce producteur.
          </div>
        )}
      </section>

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        producerId={producer.id}
        producerName={producer.company_name}
      />
    </div>
  );
}
