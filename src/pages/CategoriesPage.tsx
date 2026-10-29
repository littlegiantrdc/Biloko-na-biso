import React, { useState, useEffect } from 'react';
import { ArrowRight, Leaf, Sparkles, Wheat, Coffee, Apple, UtensilsCrossed, CupSoda, Beef, Palette, Shirt, Armchair, Hammer, Package, Boxes } from 'lucide-react';
import { Category } from '../types';

interface CategoriesPageProps {
  navigate: (path: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Wheat: <Wheat className="w-6 h-6" />,
  Apple: <Apple className="w-6 h-6" />,
  Coffee: <Coffee className="w-6 h-6" />,
  UtensilsCrossed: <UtensilsCrossed className="w-6 h-6" />,
  CupSoda: <CupSoda className="w-6 h-6" />,
  Beef: <Beef className="w-6 h-6" />,
  Palette: <Palette className="w-6 h-6" />,
  Shirt: <Shirt className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Armchair: <Armchair className="w-6 h-6" />,
  Hammer: <Hammer className="w-6 h-6" />,
  Package: <Package className="w-6 h-6" />,
  Boxes: <Boxes className="w-6 h-6" />,
};

export function CategoriesPage({ navigate }: CategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) setCategories(await res.json());
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            Filières Économiques de la RDC
          </span>
          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
            Toutes les catégories de produits congolais
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
            Explorez la diversité des secteurs productifs de la République Démocratique du Congo, de l'agriculture biologique à l'artisanat traditionnel et aux industries manufacturières.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => navigate(`/catalogue?category=${cat.slug}`)}
            className="bg-white rounded-3xl p-6 border border-stone-200/90 hover:border-emerald-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                {cat.icon && iconMap[cat.icon] ? iconMap[cat.icon] : <Leaf className="w-6 h-6" />}
              </div>

              <h2 className="text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors font-display">
                {cat.name}
              </h2>

              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>Voir les produits de cette filière</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
