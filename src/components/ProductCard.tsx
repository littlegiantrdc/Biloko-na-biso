import React from 'react';
import { Heart, MapPin, CheckCircle2, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCongolesePrice } from '../utils/rules';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
  onProducerSelect?: (producerIdOrSlug: string) => void;
}

export function ProductCard({ product, onSelect, onProducerSelect }: ProductCardProps) {
  const { isFavorite, toggleFavorite, user } = useAuth();
  const favorited = isFavorite(product.id);

  const priceLabel = formatCongolesePrice(product.price_indicative, product.currency);
  const isFallbackPrice = priceLabel === 'Contacter le producteur pour le prix';

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onSelect(product.slug || product.id)}>
        <img
          src={product.primary_image || 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10 max-w-[calc(100%-3.25rem)] pointer-events-none">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/95 backdrop-blur-xs text-emerald-950 shadow-2xs border border-white/50 truncate">
            {product.category_name || 'Produit local'}
          </span>
          {product.is_featured === 1 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-stone-900 shadow-2xs shrink-0">
              À la une
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-xs transition-transform active:scale-90 ${
            favorited
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 hover:bg-white text-stone-600 hover:text-rose-600'
          }`}
          aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          title={user ? (favorited ? 'Retirer des favoris' : 'Ajouter aux favoris') : 'Connectez-vous pour ajouter aux favoris'}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Origin Pill */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-900/80 backdrop-blur-xs text-white">
            <MapPin className="w-3 h-3 text-red-400" />
            {product.province}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          {/* Producer attribution */}
          {product.producer_name && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onProducerSelect) onProducerSelect(product.producer_slug || product.producer_id);
                }}
                className="hover:text-emerald-800 font-medium truncate text-left max-w-[180px]"
              >
                {product.producer_name}
              </button>
              {Boolean(product.producer_verified) && (
                <span title="Producteur vérifié">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </span>
              )}
            </div>
          )}

          {/* Product Name */}
          <h3
            onClick={() => onSelect(product.slug || product.id)}
            className="font-bold text-stone-900 text-base leading-snug hover:text-emerald-800 transition-colors line-clamp-2 cursor-pointer font-display"
          >
            {product.name}
          </h3>

          <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
        </div>

        {/* Footer info: Price & CTAs */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              {isFallbackPrice ? 'Tarification' : 'Prix indicatif'}
            </span>
            <p className={`text-sm font-black ${isFallbackPrice ? 'text-amber-800 text-xs italic font-medium' : 'text-emerald-950 font-display'}`}>
              {priceLabel}
            </p>
          </div>

          <button
            onClick={() => onSelect(product.slug || product.id)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-800 hover:text-white text-stone-800 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            Voir fiche
          </button>
        </div>
      </div>
    </div>
  );
}
