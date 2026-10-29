import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Leaf,
  Store,
  Users,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Product, Producer, Category, Article } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProducerCard } from '../components/ProducerCard';

interface HomePageProps {
  navigate: (path: string) => void;
}

export function HomePage({ navigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catsRes, producersRes, artsRes] = await Promise.all([
          fetch('/api/products?limit=20'),
          fetch('/api/categories'),
          fetch('/api/producers'),
          fetch('/api/articles'),
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          const all = data.products as Product[];
          setFeaturedProducts(all.filter((p) => p.is_featured === 1).slice(0, 4));
          setNewProducts(all.slice(0, 4));
          setTopRatedProducts(
            [...all].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0)).slice(0, 4)
          );
        }

        if (catsRes.ok) {
          const cats = await catsRes.json();
          setCategories(cats);
        }

        if (producersRes.ok) {
          const prods = await producersRes.json();
          setProducers(prods.slice(0, 3));
        }

        if (artsRes.ok) {
          const arts = await artsRes.json();
          setArticles(arts.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedProvince !== 'all') params.set('province', selectedProvince);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    navigate(`/catalogue?${params.toString()}`);
  }

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* SECTION 1: HERO SECTION */}
      <section className="relative overflow-hidden bg-stone-900 text-white pt-10 pb-20 sm:pt-16 sm:pb-28">
        {/* Decorative background image */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1920&q=80"
            alt="Terroirs agricoles de la RDC"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-stone-900/80 via-stone-900/90 to-stone-900" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* National Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Plateforme Nationale de Valorisation des Produits de la RDC</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-display">
              Découvrez la richesse des{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-amber-200 to-emerald-300">
                produits congolais.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-stone-300 leading-relaxed font-normal">
              Des producteurs passionnés, des savoir-faire uniques et des produits issus de nos terres et de nos ateliers. Découvrez, soutenez et faites grandir l'économie locale.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/catalogue')}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                Explorer les produits
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/inscription-producteur')}
                className="px-6 py-3.5 rounded-2xl bg-stone-800/90 hover:bg-stone-700/90 text-stone-100 font-bold text-sm border border-stone-700 transition-all cursor-pointer flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-amber-400" />
                Présenter mon entreprise
              </button>
            </div>
          </div>

          {/* Integrated Multi-Search Bar */}
          <div className="mt-12 bg-white rounded-3xl p-3 sm:p-4 shadow-2xl border border-stone-200/90 text-stone-900">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Keyword input */}
              <div className="md:col-span-5 flex items-center gap-3 px-3 py-2 bg-stone-50 rounded-2xl border border-stone-200 focus-within:border-emerald-600 focus-within:bg-white transition-all">
                <Search className="w-5 h-5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit local, un artisan, une filière..."
                  className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder:text-stone-400"
                />
              </div>

              {/* Province dropdown */}
              <div className="md:col-span-3 flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-2xl border border-stone-200">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Toutes les provinces (26)</option>
                  <option value="Kinshasa">Kinshasa</option>
                  <option value="Nord-Kivu">Nord-Kivu</option>
                  <option value="Sud-Kivu">Sud-Kivu</option>
                  <option value="Tshopo">Tshopo</option>
                  <option value="Ituri">Ituri</option>
                  <option value="Haut-Katanga">Haut-Katanga</option>
                  <option value="Kongo Central">Kongo Central</option>
                  <option value="Kwilu">Kwilu</option>
                  <option value="Kasaï">Kasaï</option>
                  <option value="Équateur">Équateur</option>
                </select>
              </div>

              {/* Category dropdown */}
              <div className="md:col-span-2 flex items-center px-3 py-2 bg-stone-50 rounded-2xl border border-stone-200">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Toutes filières</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 2: PRODUITS DU TERROIR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Catalogue officiel RDC
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display">
              Produits locaux de nos 26 provinces
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Répertoire national des créations agricoles, transformées et artisanales de la République Démocratique du Congo.
            </p>
          </div>

          <button
            onClick={() => navigate('/catalogue')}
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group shrink-0 cursor-pointer"
          >
            Accéder au catalogue complet
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-stone-200 rounded-2xl" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={(idOrSlug) => navigate(`/produit/${idOrSlug}`)}
                onProducerSelect={(slug) => navigate(`/producteurs/${slug}`)}
              />
            ))}
          </div>
        ) : (
          /* Virgin state: cleanly ready for real client products */
          <div className="bg-linear-to-br from-stone-50 via-white to-emerald-50/40 rounded-3xl p-8 sm:p-12 border border-stone-200 text-center space-y-5 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-emerald-700" />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="text-xl font-black text-stone-900 font-display">
                Le catalogue national est prêt à accueillir vos produits
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                La plateforme est prête pour le lancement officiel. Vous êtes producteur, artisan ou transformateur congolais ? Référencez vos produits dès aujourd'hui pour être mis en avant auprès des acheteurs et partenaires.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/inscription-producteur')}
                className="px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4 text-amber-300" />
                Inscrire mon entreprise gratuitement
              </button>
              <button
                onClick={() => navigate('/categories')}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm border border-stone-300 transition-all cursor-pointer"
              >
                Explorer les 13 filières de la RDC
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 3: PRODUCTEURS CONGOLAIS */}
      <section className="bg-stone-100/70 py-16 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                <Store className="w-4 h-4 text-emerald-700" />
                Entreprises & Coopératives
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display">
                Annuaire des producteurs congolais
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Les artisans, coopératives agricoles et transformateurs qui bâtissent l'économie réelle à travers nos 26 provinces.
              </p>
            </div>

            <button
              onClick={() => navigate('/producteurs')}
              className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group shrink-0 cursor-pointer"
            >
              Consulter l'annuaire
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {producers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {producers.map((prod) => (
                <ProducerCard
                  key={prod.id}
                  producer={prod}
                  onSelect={(slug) => navigate(`/producteurs/${slug}`)}
                />
              ))}
            </div>
          ) : (
            /* Virgin state: invitation for producers to register */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Store className="w-7 h-7" />
              </div>
              <div className="max-w-lg mx-auto space-y-2">
                <h3 className="text-lg font-bold text-stone-900 font-display">
                  Ouverture des inscriptions des producteurs locaux
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Soyez parmi les premières entreprises et coopératives répertoriées sur la vitrine officielle de la République Démocratique du Congo.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/inscription-producteur')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  Créer ma fiche producteur
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: CATÉGORIES POPULAIRES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
            Filières du pays
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-3 font-display">
            Catégories de produits congolais
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            De la terre et de l'atelier à la consommation, découvrez les savoir-faire classés par filière d'excellence.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 12).map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/catalogue?category=${cat.slug}`)}
              className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-600 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                  {cat.name}
                </h4>
                <span className="text-[10px] text-stone-600 mt-1 block">
                  Découvrir →
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 5: HISTOIRES & SAVOIR-FAIRE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              <BookOpen className="w-4 h-4 text-amber-500" />
              Savoir-faire et terroir
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display">
              Histoires de producteurs & savoir-faire
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Portraits, méthodes traditionnelles et innovations de la transformation locale en RDC.
            </p>
          </div>

          <button
            onClick={() => navigate('/histoires')}
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group shrink-0 cursor-pointer"
          >
            Tous les reportages
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article
                key={art.id}
                onClick={() => navigate(`/histoires/${art.slug}`)}
                className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden hover:shadow-xl hover:border-emerald-600 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                <div className="relative aspect-16/9 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={art.cover_image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-900/80 text-white backdrop-blur-xs">
                    {art.category}
                  </span>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-stone-600">
                      Temps de lecture : {art.read_time}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors mt-1 font-display line-clamp-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>Lire l'article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Virgin state for articles */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="max-w-lg mx-auto space-y-2">
              <h3 className="text-lg font-bold text-stone-900 font-display">
                Reportages & portraits de nos terroirs
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Les chroniques et récits dédiés aux femmes et hommes qui transforment les richesses de la RDC seront publiés au fur et à mesure des référencements. Vous souhaitez partager l'histoire de votre coopérative ou atelier ?
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate('/contact')}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                Proposer un sujet ou témoignage
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 6: POURQUOI SOUTENIR LES PRODUITS LOCAUX (ENGAGEMENT) */}
      <section className="bg-emerald-950 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 rounded-full">
              L'impact de notre choix
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-3 font-display">
              Pourquoi soutenir les produits locaux en RDC ?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 mt-2">
              Chaque achat de produit local contribue à transformer durablement le quotidien de nos familles et renforce l'autonomie économique de la nation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-emerald-900/50 border border-emerald-800/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                Création d'emplois durables
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Valoriser la transformation sur le sol congolais crée des emplois qualifiés pour nos jeunes dans l'agro-industrie, la meunerie, la cosmétique et l'artisanat.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-900/50 border border-emerald-800/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                Traçabilité & Qualité réelle
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Savoir exactement d'où vient son café, son chocolat ou sa farine. Les terroirs de la RDC offrent une pureté naturelle exceptionnelle sans ajouts chimiques nocifs.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-900/50 border border-emerald-800/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                Fierté & Souveraineté
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Réduire notre dépendance aux importations et hisser le « Made in RDC » au rang de standard d'excellence reconnu en Afrique et à l'international.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: APPEL À L'INSCRIPTION DES PRODUCTEURS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-8 sm:p-14 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-black/20 px-3 py-1 rounded-full">
              Vous êtes agriculteur, artisan ou transformateur ?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-display">
              Faites connaître vos produits à toute la RDC et au monde.
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
              Rejoignez gratuitement la plateforme Biloko Na Biso. Créez votre vitrine professionnelle, publiez votre catalogue et recevez directement les demandes de grossistes, distributeurs et particuliers.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/inscription-producteur')}
                className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                Inscrire mon entreprise gratuitement
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/a-propos')}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
              >
                En savoir plus sur notre mission
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
