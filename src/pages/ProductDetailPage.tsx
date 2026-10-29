import React, { useState, useEffect } from 'react';
import {
  Heart,
  Share2,
  MessageCircle,
  Building2,
  MapPin,
  CheckCircle2,
  Star,
  Package,
  Layers,
  Sparkles,
  ArrowLeft,
  Send,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Phone,
} from 'lucide-react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCongolesePrice } from '../utils/rules';
import { ContactModal } from '../components/ContactModal';

interface ProductDetailPageProps {
  productIdOrSlug: string;
  navigate: (path: string) => void;
}

export function ProductDetailPage({ productIdOrSlug, navigate }: ProductDetailPageProps) {
  const { user, isFavorite, toggleFavorite } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Modal contact state
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Share feedback
  const [copied, setCopied] = useState(false);

  // Review submission state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productIdOrSlug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productIdOrSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse space-y-4">
        <div className="h-96 bg-stone-200 rounded-3xl max-w-4xl mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-stone-900 font-display">Produit introuvable</h2>
        <p className="text-sm text-stone-500">La fiche demandée n'existe pas ou a été retirée du catalogue.</p>
        <button
          onClick={() => navigate('/catalogue')}
          className="px-6 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
        >
          Retourner au catalogue
        </button>
      </div>
    );
  }

  const priceLabel = formatCongolesePrice(product.price_indicative, product.currency);
  const isFallbackPrice = priceLabel === 'Contacter le producteur pour le prix';
  const favorited = isFavorite(product.id);

  const imagesList = product.images && product.images.length > 0
    ? product.images.map((i) => i.image_url)
    : [product.primary_image || 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80'];

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !product) return;
    setSubmittingReview(true);
    setReviewMessage(null);

    const token = localStorage.getItem('biloko_token');
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: userRating, comment: userComment }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMessage('Votre avis a été enregistré avec succès.');
        setUserComment('');
        // Refresh product
        const updatedRes = await fetch(`/api/products/${product.id}`);
        if (updatedRes.ok) setProduct(await updatedRes.json());
      } else {
        setReviewMessage(data.error || 'Erreur lors de l’envoi de votre avis.');
      }
    } catch {
      setReviewMessage('Erreur de transmission.');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top back navigation */}
      <div>
        <button
          onClick={() => navigate('/catalogue')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue des produits
        </button>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-stone-100 overflow-hidden border border-stone-200/90 shadow-md">
            <img
              src={imagesList[activeImageIndex] || imagesList[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.is_featured === 1 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-900 shadow-md">
                Produit à la une
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imagesList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-emerald-600 shadow-md scale-105' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category & Origin pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200/60">
              {product.category_name}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              {product.city_territory}, Province du {product.province}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium text-stone-500 uppercase tracking-wider">
              Type : {product.production_type}
            </span>
          </div>

          {/* Product Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 font-display tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Producer Highlight Card */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 overflow-hidden shrink-0 p-0.5">
                <img
                  src={product.producer_logo || 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=200&q=80'}
                  alt={product.producer_name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  Entreprise productrice
                </span>
                <button
                  onClick={() => navigate(`/producteurs/${product.producer_slug || product.producer_id}`)}
                  className="text-sm font-bold text-stone-900 hover:text-emerald-800 transition-colors flex items-center gap-1.5 text-left"
                >
                  {product.producer_name}
                  {Boolean(product.producer_verified) && (
                    <span title="Producteur vérifié">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate(`/producteurs/${product.producer_slug || product.producer_id}`)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 hover:border-emerald-700 bg-white text-xs font-bold text-stone-700 hover:text-emerald-800 transition-all shrink-0"
            >
              Voir son profil
            </button>
          </div>

          {/* Price & Availability Box */}
          <div className="p-5 rounded-3xl bg-emerald-950 text-white space-y-4 shadow-md">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-300 block">
                  {isFallbackPrice ? 'Prix du producteur' : 'Prix indicatif unitaire'}
                </span>
                <p className={`text-2xl sm:text-3xl font-black ${isFallbackPrice ? 'text-amber-300 text-lg font-medium italic' : 'text-white font-display'}`}>
                  {priceLabel}
                </p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/20">
                  {product.availability === 'available'
                    ? 'Disponible en stock'
                    : product.availability === 'on_order'
                    ? 'Fabriqué sur commande'
                    : 'Disponibilité saisonnière'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-900/80 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-400" />
                Vente en gros : {product.wholesale_available ? 'Acceptée (B2B)' : 'Non disponible'}
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                Vente au détail : {product.retail_available ? 'Disponible' : 'Réservé aux pros'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setContactModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Demander un devis / Contacter
              </button>

              {product.directWhatsAppUrl && (
                <a
                  href={product.directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contacter sur WhatsApp
                </a>
              )}
            </div>

            {/* Secondary actions: Favorite & Share */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  favorited ? 'text-rose-400 font-bold' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-400' : ''}`} />
                {favorited ? 'Dans vos favoris' : 'Ajouter aux favoris'}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-300 hover:text-white transition-colors"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Lien copié !' : 'Partager ce produit'}
              </button>
            </div>
          </div>

          {/* Short & Full Description */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-900 font-display">
              Description & Histoire du produit
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {product.full_description}
            </p>
          </div>

          {/* Specifications Table */}
          <div className="rounded-2xl border border-stone-200 overflow-hidden divide-y divide-stone-200 text-xs">
            {product.raw_materials && (
              <div className="p-3.5 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-stone-600">Matières premières & Ingrédients :</span>
                <span className="text-stone-900 font-medium sm:text-right">{product.raw_materials}</span>
              </div>
            )}
            {product.manufacturing_process && (
              <div className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-stone-600">Processus de transformation :</span>
                <span className="text-stone-900 font-medium sm:text-right">{product.manufacturing_process}</span>
              </div>
            )}
            {product.packaging_variants && (
              <div className="p-3.5 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-stone-600">Conditionnements & Formats :</span>
                <span className="text-stone-900 font-medium sm:text-right">{product.packaging_variants}</span>
              </div>
            )}
            {product.certifications_labels && (
              <div className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-stone-600">Labels & Certifications :</span>
                <span className="text-emerald-800 font-bold sm:text-right flex items-center gap-1 sm:justify-end">
                  <FileCheck className="w-3.5 h-3.5" />
                  {product.certifications_labels}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REVIEWS & RATINGS SECTION */}
      <section className="pt-10 border-t border-stone-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
              Avis et Retours d'Expérience
            </h2>
            <p className="text-xs text-stone-500">
              Avis authentiques rédigés par les membres de la communauté.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-xl font-black text-stone-900 font-display">
                {product.average_rating ? product.average_rating.toFixed(1) : '—'}
              </span>
            </div>
            <span className="text-xs text-stone-500 font-semibold">
              ({product.review_count || 0} avis)
            </span>
          </div>
        </div>

        {/* Post Review Form for logged in users */}
        {user ? (
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/90 space-y-4">
            <h3 className="text-sm font-bold text-stone-900">
              Donnez votre avis sur ce produit local
            </h3>

            {reviewMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {reviewMessage}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Votre note :
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setUserRating(num)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${num <= userRating ? 'fill-amber-400' : 'text-stone-300'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-2">{userRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Votre commentaire constructif :
                </label>
                <textarea
                  required
                  rows={3}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Partagez votre avis sur le goût, la texture, la finition ou la conformité..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="py-2.5 px-5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors disabled:opacity-50"
              >
                {submittingReview ? 'Publication...' : 'Publier mon avis'}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-center text-xs text-stone-600">
            <span>Vous devez être connecté pour publier un avis. </span>
            <button
              onClick={() => navigate('/connexion')}
              className="text-emerald-800 font-bold hover:underline"
            >
              Se connecter
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                      {rev.author_name ? rev.author_name[0].toUpperCase() : 'M'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{rev.author_name || 'Membre vérifié'}</h4>
                      <span className="text-[10px] text-stone-400">
                        {new Date(rev.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-stone-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">{rev.comment}</p>

                {rev.producer_reply && (
                  <div className="mt-2 p-3 rounded-xl bg-stone-50 border-l-2 border-emerald-600 text-xs text-stone-700 space-y-1">
                    <p className="font-bold text-emerald-900">Réponse du producteur :</p>
                    <p>{rev.producer_reply}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-500 italic">
              Aucun avis pour le moment. Soyez le premier à évaluer ce produit congolais !
            </p>
          )}
        </div>
      </section>

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        producerId={product.producer_id}
        producerName={product.producer_name || ''}
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}
