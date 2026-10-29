import React from 'react';
import { MapPin, CheckCircle2, Package, MessageCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { Producer } from '../types';
import { formatWhatsAppLink } from '../utils/rules';

interface ProducerCardProps {
  producer: Producer;
  onSelect: (slugOrId: string) => void;
}

export function ProducerCard({ producer, onSelect }: ProducerCardProps) {
  const whatsappUrl = formatWhatsAppLink(
    producer.whatsapp || producer.phone,
    `Bonjour ${producer.company_name}, j'ai découvert votre entreprise sur Biloko Na Biso.`
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500/60 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Banner / Header */}
      <div className="h-28 w-full bg-linear-to-r from-emerald-900 via-teal-900 to-stone-900 relative overflow-hidden">
        {producer.banner_url ? (
          <img src={producer.banner_url} alt="" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        )}

        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-stone-900 backdrop-blur-xs shadow-xs flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-emerald-700" />
            {producer.product_count || 0} produit{(producer.product_count || 0) > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Body & Logo */}
      <div className="px-5 pb-5 pt-0 flex-grow flex flex-col justify-between -mt-10">
        <div>
          {/* Logo & Verification */}
          <div className="flex items-end justify-between mb-3">
            <div className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-white shadow-md overflow-hidden shrink-0">
              <img
                src={producer.logo_url || 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=200&q=80'}
                alt={producer.company_name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {Boolean(producer.is_verified) ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Vérifié
              </span>
            ) : (
              <span className="text-[11px] font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                Vérification en cours
              </span>
            )}
          </div>

          {/* Title & Location */}
          <h3
            onClick={() => onSelect(producer.slug || producer.id)}
            className="text-lg font-bold text-stone-900 hover:text-emerald-800 transition-colors cursor-pointer line-clamp-1 font-display"
          >
            {producer.company_name}
          </h3>

          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              {producer.city_territory}, {producer.province}
            </span>
            <span>•</span>
            <span className="truncate">{producer.sector}</span>
          </div>

          <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 leading-relaxed">
            {producer.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-2">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp
            </a>
          ) : (
            <span />
          )}

          <button
            onClick={() => onSelect(producer.slug || producer.id)}
            className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-1"
          >
            Voir profil
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
