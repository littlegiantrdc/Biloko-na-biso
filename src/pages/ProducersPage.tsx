import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle2, SlidersHorizontal, Store } from 'lucide-react';
import { Producer } from '../types';
import { ProducerCard } from '../components/ProducerCard';

interface ProducersPageProps {
  navigate: (path: string) => void;
}

export function ProducersPage({ navigate }: ProducersPageProps) {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    async function fetchProducers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (province !== 'all') params.set('province', province);
        if (verifiedOnly) params.set('verified', '1');

        const res = await fetch(`/api/producers?${params.toString()}`);
        if (res.ok) {
          setProducers(await res.json());
        }
      } catch (err) {
        console.error('Error fetching producers:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducers();
  }, [search, province, verifiedOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            Annuaire des Producteurs de la RDC
          </span>
          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
            Rencontrez les artisans et coopératives du Congo
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
            Trouvez les producteurs locaux par province, découvrez leurs méthodes de travail et contactez-les directement pour vos approvisionnements ou partenariats.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-grow max-w-2xl">
          {/* Search */}
          <div className="relative flex-grow min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une entreprise, coopérative, ville..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>

          {/* Province */}
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-700 bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes les provinces (26)</option>
            <option value="Kinshasa">Kinshasa</option>
            <option value="Nord-Kivu">Nord-Kivu</option>
            <option value="Sud-Kivu">Sud-Kivu</option>
            <option value="Tshopo">Tshopo</option>
            <option value="Ituri">Ituri</option>
            <option value="Kwilu">Kwilu</option>
            <option value="Kasaï">Kasaï</option>
            <option value="Haut-Katanga">Haut-Katanga</option>
            <option value="Kongo Central">Kongo Central</option>
          </select>
        </div>

        {/* Verified checkbox */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="rounded text-emerald-700 focus:ring-emerald-700 h-4 w-4"
          />
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Producteurs vérifiés uniquement
          </span>
        </label>
      </div>

      {/* Producer Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-stone-200 rounded-2xl" />
          ))}
        </div>
      ) : producers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {producers.map((prod) => (
            <ProducerCard
              key={prod.id}
              producer={prod}
              onSelect={(slug) => navigate(`/producteurs/${slug}`)}
            />
          ))}
        </div>
      ) : (search || province !== 'all' || verifiedOnly) ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-2xs space-y-4">
          <Store className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-900 font-display">Aucun producteur ne correspond à vos filtres</h3>
          <button
            onClick={() => {
              setSearch('');
              setProvince('all');
              setVerifiedOnly(false);
            }}
            className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        /* Virgin state for producers directory */
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-stone-200/90 shadow-xs space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-black text-stone-900 font-display">
              Annuaire national des producteurs de la RDC
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              La plateforme officielle est prête à accueillir les artisans, coopératives agricoles et transformateurs des 26 provinces du Congo. Inscrivez votre entreprise pour être immédiatement visible.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate('/inscription-producteur')}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Inscrire mon entreprise gratuitement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
