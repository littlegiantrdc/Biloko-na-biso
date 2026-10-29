import React from 'react';
import { Mail, Phone, ExternalLink, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export function Footer({ navigate }: FooterProps) {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      {/* DRC National Honor Banner (moved logically from header to footer as requested) */}
      <div className="bg-emerald-950/90 border-b border-emerald-800/60 py-3.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-emerald-100">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-pulse" />
            <strong className="text-white font-bold">République Démocratique du Congo</strong>
            <span className="hidden sm:inline text-emerald-400">•</span>
            <span>Valorisation du savoir-faire et des terroirs locaux</span>
          </span>
          <span className="text-emerald-400 hidden sm:inline">•</span>
          <span className="text-amber-300 font-bold">Un produit de Little Giants</span>
        </div>
      </div>

      {/* Decorative DRC flag ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-sky-500" title="Bleu : Paix et fleuve Congo" />
        <div className="h-full w-1/3 bg-amber-400" title="Jaune : Richesse géologique et agricole" />
        <div className="h-full w-1/3 bg-red-600" title="Rouge : Sang des martyrs et courage" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission column (Clean cutout transparent logo, no square framing) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-transparent.png"
                alt="Biloko Na Biso"
                className="h-14 w-auto object-contain shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
              <div>
                <h3 className="text-xl font-black text-white tracking-tight font-display">
                  BILOKO NA BISO
                </h3>
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  Le savoir-faire congolais, à portée du monde
                </p>
              </div>
            </div>

            <p className="text-sm text-stone-400 leading-relaxed pr-4">
              Plateforme numérique nationale dédiée à répertorier, valoriser et promouvoir les produits locaux,
              artisans, coopératives agricoles et transformateurs des 26 provinces de la République Démocratique du Congo.
            </p>

            {/* Little Giants Attribution Box */}
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Initiative Little Giants
                </span>
                <span className="text-[10px] text-stone-300 bg-stone-800 border border-stone-700 px-2 py-0.5 rounded-full font-medium">
                  Produit officiel
                </span>
              </div>

              <p className="text-xs text-stone-200 font-medium">
                « Biloko Na Biso est un produit de Little Giants. »
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <a
                  href="https://littlegiantrdc.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 underline underline-offset-2"
                >
                  Site Little Giants
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href="https://wa.me/243858960478"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  WhatsApp: +243 858 960 478
                </a>

                <a
                  href="mailto:littlegiantrdc@gmail.com"
                  className="text-stone-300 hover:text-white flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  littlegiantrdc@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-amber-400 transition-colors">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/catalogue')} className="hover:text-amber-400 transition-colors">
                  Catalogue des produits
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/producteurs')} className="hover:text-amber-400 transition-colors">
                  Annuaire des producteurs
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/categories')} className="hover:text-amber-400 transition-colors">
                  Catégories de produits
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/histoires')} className="hover:text-amber-400 transition-colors">
                  Histoires & Savoir-faire
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/a-propos')} className="hover:text-amber-400 transition-colors">
                  À propos du projet
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-amber-400 transition-colors">
                  Nous contacter
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">
              Filières congolaises
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => navigate('/catalogue?category=cafe-cacao-plantation')} className="hover:text-amber-400 transition-colors text-left">
                  Cafés & Cacaos de plantation
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/catalogue?category=agriculture-et-cereales')} className="hover:text-amber-400 transition-colors text-left">
                  Agriculture, farines & tubercules
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/catalogue?category=boissons-naturelles')} className="hover:text-amber-400 transition-colors text-left">
                  Boissons, thés & infusions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/catalogue?category=alimentaires-transformes')} className="hover:text-amber-400 transition-colors text-left">
                  Agroalimentaire & Produits transformés
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/catalogue?category=artisanat-fait-main')} className="hover:text-amber-400 transition-colors text-left">
                  Artisanat d'art & Sculpture
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/catalogue?category=cosmetique-soins-locaux')} className="hover:text-amber-400 transition-colors text-left">
                  Cosmétiques & Soins naturels
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Commitment */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">
              Informations & Éthique
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-amber-400 transition-colors">
                  Questions fréquentes (FAQ)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/regles-publication')} className="hover:text-amber-400 transition-colors">
                  Règles de publication
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/politique-confidentialite')} className="hover:text-amber-400 transition-colors">
                  Politique de confidentialité
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/conditions-utilisation')} className="hover:text-amber-400 transition-colors">
                  Conditions d'utilisation
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/inscription-producteur')} className="text-amber-400 font-bold hover:underline">
                  Inscrire mon entreprise
                </button>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-stone-400 border-t border-stone-800">
              <p className="flex items-center gap-1.5 text-stone-400">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                Kinshasa & 26 Provinces de la RDC
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Biloko Na Biso. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <p className="text-stone-300">
              Conçu avec fierté pour l'économie nationale congolaise.
            </p>
            <a
              href="https://littlegiantrdc.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              Little Giants RDC
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
