import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Check,
} from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

interface CatalogPageProps {
  navigate: (path: string) => void;
  initialSearch?: string;
  initialCategory?: string;
  initialProvince?: string;
}

export function CatalogPage({ navigate, initialSearch = '', initialCategory = 'all', initialProvince = 'all' }: CatalogPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<{ name: string; productCount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [province, setProvince] = useState(initialProvince);
  const [availability, setAvailability] = useState('all');
  const [wholesaleOnly, setWholesaleOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load categories and provinces once
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, provRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/provinces'),
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (provRes.ok) setProvinces(await provRes.json());
      } catch (err) {
        console.error('Error fetching catalog metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch products whenever filters or page changes
  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (category !== 'all') params.set('category', category);
        if (province !== 'all') params.set('province', province);
        if (availability !== 'all') params.set('availability', availability);
        if (wholesaleOnly) params.set('wholesale', '1');
        params.set('sort', sort);
        params.set('page', page.toString());
        params.set('limit', '12');

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotalCount(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFiltered();
  }, [search, category, province, availability, wholesaleOnly, sort, page]);

  function resetFilters() {
    setSearch('');
    setCategory('all');
    setProvince('all');
    setAvailability('all');
    setWholesaleOnly(false);
    setSort('newest');
    setPage(1);
  }

  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'all' ||
    province !== 'all' ||
    availability !== 'all' ||
    wholesaleOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            Catalogue National des Produits
          </span>
          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
            Découvrez les produits de nos provinces
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Consultez les créations agricoles, artisanales et industrielles fabriquées ou transformées sur le sol de la République Démocratique du Congo.
          </p>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                Filtrer le catalogue
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Recherche par mot-clé
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Rechercher un produit, filière..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Catégorie de produit
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-700 bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Provinces of DRC */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Province d'origine (RDC)
              </label>
              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-700 bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes les provinces (26)</option>
                {provinces.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} {p.productCount > 0 ? `(${p.productCount})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Disponibilité
              </label>
              <select
                value={availability}
                onChange={(e) => {
                  setAvailability(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-700 bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes disponibilités</option>
                <option value="available">En stock / Disponible</option>
                <option value="on_order">Sur commande</option>
                <option value="seasonal">Saisonnier</option>
              </select>
            </div>

            {/* Wholesale checkbox */}
            <div className="pt-2 border-t border-stone-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={wholesaleOnly}
                  onChange={(e) => {
                    setWholesaleOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded text-emerald-700 focus:ring-emerald-700 h-4 w-4"
                />
                <span>Vente en gros acceptée (B2B)</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Bar: Results Count + Sort + Mobile Filter Toggle */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-800 flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                Filtres {hasActiveFilters && '•'}
              </button>
              <p className="text-xs sm:text-sm font-semibold text-stone-700">
                <span className="font-bold text-stone-900">{totalCount}</span> produit{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium hidden sm:inline">Trier par :</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                <option value="newest">Plus récents</option>
                <option value="popular">Popularité (vues)</option>
                <option value="rating">Mieux notés</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden bg-white p-5 rounded-3xl border border-stone-200 shadow-lg space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900">Filtres de recherche</h3>
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="text-xs text-rose-600 font-semibold">
                    Réinitialiser
                  </button>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Recherche..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  <option value="all">Catégories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  <option value="all">Provinces</option>
                  {provinces.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                Appliquer les filtres
              </button>
            </div>
          )}

          {/* Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-stone-200/80 rounded-2xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={(idOrSlug) => navigate(`/produit/${idOrSlug}`)}
                  onProducerSelect={(slug) => navigate(`/producteurs/${slug}`)}
                />
              ))}
            </div>
          ) : hasActiveFilters ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-2xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-display">
                Aucun produit ne correspond à ces critères
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Essayez d'élargir votre recherche, de sélectionner une autre province ou de réinitialiser vos filtres.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
              >
                Afficher tous les produits
              </button>
            </div>
          ) : (
            /* Virgin state: platform is fresh & waiting for producers to list products */
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-stone-200/90 shadow-xs space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-black text-stone-900 font-display">
                  Le catalogue est prêt pour vos produits
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Aucun produit n'a encore été publié dans cette version officielle. Vous êtes producteur, coopérative ou artisan congolais ? Inscrivez votre entreprise et référencez vos produits dès aujourd'hui.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/inscription-producteur')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Inscrire mon entreprise
                </button>
                <button
                  onClick={() => navigate('/categories')}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Découvrir les filières
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-700"
                aria-label="Page précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-stone-700 px-3">
                Page {page} sur {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed text-stone-700"
                aria-label="Page suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
