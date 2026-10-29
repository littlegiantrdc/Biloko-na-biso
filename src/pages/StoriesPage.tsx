import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, ArrowLeft, Clock, User, Share2 } from 'lucide-react';
import { Article } from '../types';

interface StoriesPageProps {
  navigate: (path: string) => void;
}

export function StoriesPage({ navigate }: StoriesPageProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/articles');
        if (res.ok) setArticles(await res.json());
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            Magazine & Savoir-Faire
          </span>
          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
            Histoires des producteurs & Terroirs de la RDC
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Plongez au cœur des initiatives congolaises, des méthodes de transformation locales et des histoires humaines qui font la richesse de nos 26 provinces.
          </p>
        </div>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art) => (
            <article
              key={art.id}
              onClick={() => navigate(`/histoires/${art.slug}`)}
              className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden hover:shadow-xl hover:border-emerald-600 transition-all duration-300 flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden">
                <img
                  src={art.cover_image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-stone-900/80 text-white backdrop-blur-xs">
                  {art.category}
                </span>
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs text-stone-400 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    {art.read_time} de lecture
                  </span>
                  <h2 className="text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors font-display line-clamp-2">
                    {art.title}
                  </h2>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>Lire le reportage complet</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Virgin state for stories & insights */
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-stone-200/90 shadow-xs space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-black text-stone-900 font-display">
              La rédaction des récits de terroir est ouverte
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Cette rubrique mettra en lumière les parcours, savoir-faire ancestraux et procédés de transformation des femmes et hommes qui font vivre la production congolaise.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Proposer un sujet de reportage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ArticleDetailPage({ slug, navigate }: { slug: string; navigate: (path: string) => void }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${slug}`);
        if (res.ok) setArticle(await res.json());
      } catch (err) {
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse h-96 bg-stone-200 rounded-3xl" />;
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display">Article non trouvé</h2>
        <button onClick={() => navigate('/histoires')} className="px-5 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold">
          Retour aux articles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <button
          onClick={() => navigate('/histoires')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la rubrique Savoir-Faire
        </button>
      </div>

      <div className="space-y-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {article.category}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-stone-900 font-display tracking-tight leading-tight">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pb-4 border-b border-stone-200">
          <span className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-emerald-700" />
            Par {article.author_name}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            Lecture {article.read_time}
          </span>
          <span>Publié le {new Date(article.published_at).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      <div className="relative aspect-16/9 w-full rounded-3xl overflow-hidden shadow-lg border border-stone-200">
        <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
      </div>

      <div className="prose prose-stone max-w-none text-stone-800 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-serif sm:font-sans">
        {article.content}
      </div>

      <div className="pt-8 border-t border-stone-200 flex items-center justify-between">
        <button
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
          className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {copied ? 'Lien copié !' : 'Partager cet article'}
        </button>

        <button
          onClick={() => navigate('/catalogue')}
          className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs"
        >
          Découvrir les produits associés
        </button>
      </div>
    </div>
  );
}
