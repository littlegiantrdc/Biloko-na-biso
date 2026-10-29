import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Mail,
  Eye,
  Store,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  Settings,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product, ContactRequest, Category } from '../types';
import { formatCongolesePrice } from '../utils/rules';

interface ProducerDashboardProps {
  navigate: (path: string) => void;
}

export function ProducerDashboard({ navigate }: ProducerDashboardProps) {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'apercu' | 'produits' | 'nouveau-produit' | 'demandes' | 'profil' | 'verification'>('apercu');

  // Stats state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<ContactRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form state
  const [prodName, setProdName] = useState('');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodFullDesc, setProdFullDesc] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodSubCategory, setProdSubCategory] = useState('');
  const [prodProvince, setProdProvince] = useState('Kinshasa');
  const [prodCity, setProdCity] = useState('');
  const [prodType, setProdType] = useState('transforme');
  const [prodMaterials, setProdMaterials] = useState('');
  const [prodProcess, setProdProcess] = useState('');
  const [prodVariants, setProdVariants] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCurrency, setProdCurrency] = useState('USD');
  const [prodAvailability, setProdAvailability] = useState('available');
  const [prodWholesale, setProdWholesale] = useState(true);
  const [prodRetail, setProdRetail] = useState(true);
  const [prodCerts, setProdCerts] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodStatus, setProdStatus] = useState('published');
  const [formMsg, setFormMsg] = useState<{ error?: string; success?: string } | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Verification request form state
  const [verifNotes, setVerifNotes] = useState('');
  const [verifDocs, setVerifDocs] = useState('');
  const [verifMsg, setVerifMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    loadDashboard();
  }, [token]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [dashRes, prodsRes, inqRes, catsRes] = await Promise.all([
        fetch('/api/producer/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/producer/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/producer/inquiries', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/categories'),
      ]);

      if (dashRes.ok) setDashboardData(await dashRes.json());
      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (inqRes.ok) setInquiries(await inqRes.json());
      if (catsRes.ok) {
        const cats = await catsRes.json();
        setCategories(cats);
        if (cats.length > 0 && !prodCategory) {
          setProdCategory(cats[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function startEditProduct(p: Product) {
    setEditingProduct(p);
    setProdName(p.name);
    setProdShortDesc(p.short_description);
    setProdFullDesc(p.full_description);
    setProdCategory(p.category_id);
    setProdSubCategory(p.sub_category || '');
    setProdProvince(p.province);
    setProdCity(p.city_territory);
    setProdType(p.production_type);
    setProdMaterials(p.raw_materials || '');
    setProdProcess(p.manufacturing_process || '');
    setProdVariants(p.packaging_variants || '');
    setProdPrice(p.price_indicative ? String(p.price_indicative) : '');
    setProdCurrency(p.currency || 'USD');
    setProdAvailability(p.availability);
    setProdWholesale(Boolean(p.wholesale_available));
    setProdRetail(Boolean(p.retail_available));
    setProdCerts(p.certifications_labels || '');
    setProdImageUrl(p.primary_image || '');
    setProdStatus(p.status);
    setActiveTab('nouveau-produit');
  }

  function resetProductForm() {
    setEditingProduct(null);
    setProdName('');
    setProdShortDesc('');
    setProdFullDesc('');
    setProdSubCategory('');
    setProdMaterials('');
    setProdProcess('');
    setProdVariants('');
    setProdPrice('');
    setProdCerts('');
    setProdImageUrl('');
    setProdStatus('published');
    setFormMsg(null);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg(null);

    const payload = {
      name: prodName,
      shortDescription: prodShortDesc,
      fullDescription: prodFullDesc || prodShortDesc,
      categoryId: prodCategory,
      subCategory: prodSubCategory,
      province: prodProvince,
      cityTerritory: prodCity || prodProvince,
      productionType: prodType,
      rawMaterials: prodMaterials,
      manufacturingProcess: prodProcess,
      packagingVariants: prodVariants,
      priceIndicative: prodPrice ? parseFloat(prodPrice) : null,
      currency: prodCurrency,
      availability: prodAvailability,
      wholesaleAvailable: prodWholesale,
      retailAvailable: prodRetail,
      certificationsLabels: prodCerts,
      images: prodImageUrl ? [prodImageUrl] : [],
      status: prodStatus,
    };

    try {
      const url = editingProduct
        ? `/api/producer/products/${editingProduct.id}`
        : '/api/producer/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFormMsg({ success: 'Produit enregistré avec succès !' });
        loadDashboard();
        setTimeout(() => {
          resetProductForm();
          setActiveTab('produits');
        }, 1200);
      } else {
        setFormMsg({ error: data.error || 'Erreur lors de l’enregistrement.' });
      }
    } catch {
      setFormMsg({ error: 'Erreur réseau.' });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Êtes-vous certain de vouloir supprimer ce produit du catalogue ?')) return;
    try {
      const res = await fetch(`/api/producer/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateInquiryStatus(id: string, status: string) {
    try {
      await fetch(`/api/producer/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRequestVerification(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/producer/request-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: verifNotes, documentLinks: verifDocs }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerifMsg(data.message);
        loadDashboard();
      }
    } catch {
      setVerifMsg('Erreur de transmission.');
    }
  }

  if (!user || (user.role !== 'producer' && user.role !== 'admin')) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Store className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900 font-display">Accès Producteur Requis</h2>
        <p className="text-xs text-stone-600">Vous devez posséder un compte professionnel producteur pour accéder à cette interface.</p>
        <button
          onClick={() => navigate('/inscription-producteur')}
          className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
        >
          Créer un compte producteur
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Company Info */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-emerald-600 overflow-hidden shrink-0 shadow-md">
            <img
              src={dashboardData?.profile?.logo_url || 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=200&q=80'}
              alt=""
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display text-white">
                {dashboardData?.profile?.company_name || 'Espace Producteur'}
              </h1>
              {Boolean(dashboardData?.profile?.is_verified) ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Vérifié
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-amber-300 bg-amber-950/60 border border-amber-500/30">
                  Non vérifié
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Responsable : {dashboardData?.profile?.manager_name} • {dashboardData?.profile?.city_territory}, {dashboardData?.profile?.province}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dashboardData?.profile?.slug && (
            <button
              onClick={() => navigate(`/producteurs/${dashboardData.profile.slug}`)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Voir ma page publique
            </button>
          )}

          <button
            onClick={() => {
              resetProductForm();
              setActiveTab('nouveau-produit');
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('apercu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'apercu' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Vue d'ensemble
        </button>

        <button
          onClick={() => setActiveTab('produits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'produits' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Mes produits ({products.length})
        </button>

        <button
          onClick={() => {
            resetProductForm();
            setActiveTab('nouveau-produit');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'nouveau-produit' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
        </button>

        <button
          onClick={() => setActiveTab('demandes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 relative ${
            activeTab === 'demandes' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Demandes reçues
          {inquiries.filter((i) => i.status === 'new').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'verification' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Badge de vérification
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'apercu' && (
        <div className="space-y-8">
          {/* Key metrics cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold">Produits publiés</span>
              <p className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                {dashboardData?.products?.published || 0}
              </p>
              <span className="text-[10px] text-emerald-700 font-bold">Actifs au catalogue</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold">Vues cumulées</span>
              <p className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                {dashboardData?.products?.total_product_views || 0}
              </p>
              <span className="text-[10px] text-stone-400 font-medium">Consultations réelles</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold">Demandes reçues</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-800 font-display">
                {dashboardData?.inquiries?.total || 0}
              </p>
              <span className="text-[10px] text-stone-400 font-medium">Messages et devis</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold">Ajouts aux favoris</span>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 font-display">
                {dashboardData?.totalFavorites || 0}
              </p>
              <span className="text-[10px] text-stone-400 font-medium">Par les visiteurs</span>
            </div>
          </div>

          {/* Recent Inquiries Snippet */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700" />
                Dernières demandes de contact
              </h2>
              <button
                onClick={() => setActiveTab('demandes')}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Voir toutes les demandes →
              </button>
            </div>

            {inquiries.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {inquiries.slice(0, 3).map((inq) => (
                  <div key={inq.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">{inq.sender_name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
                          {inq.request_type}
                        </span>
                        {inq.status === 'new' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{inq.message}</p>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0">
                      {new Date(inq.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">Aucune demande reçue pour le moment.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGER */}
      {activeTab === 'produits' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 font-display">
              Catalogue de vos produits ({products.length})
            </h2>
            <button
              onClick={() => {
                resetProductForm();
                setActiveTab('nouveau-produit');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau produit
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4">Prix indicatif</th>
                    <th className="py-3 px-4">Disponibilité</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Vues</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/70">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.primary_image || 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=100&q=80'}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-stone-900 line-clamp-1">{p.name}</span>
                            <span className="text-[10px] text-stone-400">{p.province}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{p.category_name}</td>
                      <td className="py-3 px-4 font-bold text-stone-800">
                        {formatCongolesePrice(p.price_indicative, p.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                          {p.availability === 'available' ? 'En stock' : 'Sur commande'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'published'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {p.status === 'published' ? 'Publié' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-500">{p.views_count}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startEditProduct(p)}
                            className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADD / EDIT PRODUCT FORM */}
      {activeTab === 'nouveau-produit' && (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/90 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-xl font-black text-stone-900 font-display">
                {editingProduct ? 'Modifier la fiche produit' : 'Ajouter un nouveau produit'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Renseignez avec précision l'origine, les spécificités et la disponibilité.
              </p>
            </div>
            {editingProduct && (
              <button
                onClick={() => {
                  resetProductForm();
                  setActiveTab('produits');
                }}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                Annuler
              </button>
            )}
          </div>

          {formMsg?.error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">
              {formMsg.error}
            </div>
          )}
          {formMsg?.success && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
              {formMsg.success}
            </div>
          )}

          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nom complet du produit *
              </label>
              <input
                type="text"
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="Ex : Café Arabica Bourbon Kivu 250g"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Catégorie *</label>
                <select
                  required
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Sous-catégorie / Spécialité</label>
                <input
                  type="text"
                  value={prodSubCategory}
                  onChange={(e) => setProdSubCategory(e.target.value)}
                  placeholder="Ex : Café en grains torréfié"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Province d'origine *</label>
                <select
                  value={prodProvince}
                  onChange={(e) => setProdProvince(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none"
                >
                  <option value="Kinshasa">Kinshasa</option>
                  <option value="Nord-Kivu">Nord-Kivu</option>
                  <option value="Sud-Kivu">Sud-Kivu</option>
                  <option value="Tshopo">Tshopo</option>
                  <option value="Ituri">Ituri</option>
                  <option value="Kwilu">Kwilu</option>
                  <option value="Kasaï">Kasaï</option>
                  <option value="Haut-Katanga">Haut-Katanga</option>
                  <option value="Kongo Central">Kongo Central</option>
                  <option value="Équateur">Équateur</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ville / Territoire</label>
                <input
                  type="text"
                  value={prodCity}
                  onChange={(e) => setProdCity(e.target.value)}
                  placeholder="Ex : Goma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Type de production</label>
                <select
                  value={prodType}
                  onChange={(e) => setProdType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none"
                >
                  <option value="transforme">Transformé</option>
                  <option value="agricole">Agricole brut</option>
                  <option value="artisanal">Artisanal</option>
                  <option value="manufacture">Manufacturé</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Description courte (accroche) *</label>
              <textarea
                required
                rows={2}
                value={prodShortDesc}
                onChange={(e) => setProdShortDesc(e.target.value)}
                placeholder="Résumé concis visible sur la carte produit..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Description détaillée & Histoire</label>
              <textarea
                rows={4}
                value={prodFullDesc}
                onChange={(e) => setProdFullDesc(e.target.value)}
                placeholder="Détaillez le savoir-faire, les bienfaits, la récolte ou les recommandations d'utilisation..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Matières premières ou Ingrédients</label>
                <input
                  type="text"
                  value={prodMaterials}
                  onChange={(e) => setProdMaterials(e.target.value)}
                  placeholder="Ex : 100% Cerises Arabica"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Processus de fabrication</label>
                <input
                  type="text"
                  value={prodProcess}
                  onChange={(e) => setProdProcess(e.target.value)}
                  placeholder="Ex : Lavage eau de source, séchage lits suspendus"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Prix indicatif (laisser vide si sur devis)</label>
                <input
                  type="number"
                  step="0.01"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="Ex : 8.50"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Devise</label>
                <select
                  value={prodCurrency}
                  onChange={(e) => setProdCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="CDF">Franc Congolais (CDF)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Disponibilité</label>
                <select
                  value={prodAvailability}
                  onChange={(e) => setProdAvailability(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none"
                >
                  <option value="available">Disponible en stock</option>
                  <option value="on_order">Sur commande</option>
                  <option value="seasonal">Saisonnier</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">URL de l'image principale</label>
              <input
                type="url"
                value={prodImageUrl}
                onChange={(e) => setProdImageUrl(e.target.value)}
                placeholder="https://... (ou URL d'image hébergée)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Une image par défaut authentique sera utilisée si vous n'en fournissez pas.</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={prodWholesale}
                  onChange={(e) => setProdWholesale(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-700 h-4 w-4"
                />
                <span>Vente en gros acceptée</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={prodRetail}
                  onChange={(e) => setProdRetail(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-700 h-4 w-4"
                />
                <span>Vente au détail</span>
              </label>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <button
                type="submit"
                disabled={formLoading}
                className="py-3 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {formLoading ? 'Enregistrement...' : editingProduct ? 'Mettre à jour le produit' : 'Publier ce produit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: INQUIRIES INBOX */}
      {activeTab === 'demandes' && (
        <div className="space-y-6">
          <h2 className="text-base font-bold text-stone-900 font-display">
            Boîte de réception des demandes ({inquiries.length})
          </h2>

          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs divide-y divide-stone-100">
            {inquiries.length > 0 ? (
              inquiries.map((inq) => (
                <div key={inq.id} className="p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900">{inq.sender_name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                          {inq.request_type}
                        </span>
                        {inq.status === 'new' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        E-mail : <a href={`mailto:${inq.sender_email}`} className="text-emerald-800 underline">{inq.sender_email}</a>
                        {inq.sender_phone && ` • Tél : ${inq.sender_phone}`}
                        {inq.product_name && ` • Produit : ${inq.product_name}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 bg-white"
                      >
                        <option value="new">Nouveau</option>
                        <option value="read">Lu</option>
                        <option value="in_progress">En cours</option>
                        <option value="closed">Clôturé</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-stone-800 bg-stone-50 p-4 rounded-2xl whitespace-pre-line leading-relaxed">
                    {inq.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-xs text-stone-500 italic">
                Aucune demande reçue pour le moment.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BADGE DE VÉRIFICATION */}
      {activeTab === 'verification' && (
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/90 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <ShieldCheck className="w-12 h-12 text-emerald-700 mx-auto" />
            <h2 className="text-xl font-black text-stone-900 font-display">
              Demande de badge « Producteur Vérifié »
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pour renforcer la confiance des acheteurs, l'administration attribue le badge officiel après contrôle de vos justificatifs (statuts, RCCM, numéro Id. Nat ou agrément coopératif).
            </p>
          </div>

          {verifMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
              {verifMsg}
            </div>
          )}

          <form onSubmit={handleRequestVerification} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Numéro RCCM / Id. Nat ou référence d'enregistrement légal
              </label>
              <input
                type="text"
                required
                value={verifDocs}
                onChange={(e) => setVerifDocs(e.target.value)}
                placeholder="Ex : RCCM CD/KIN/... ou Agrément Coopératif N°..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Notes ou informations complémentaires pour l'audit
              </label>
              <textarea
                rows={3}
                value={verifNotes}
                onChange={(e) => setVerifNotes(e.target.value)}
                placeholder="Précisez la date de constitution, vos agréments sanitaires éventuels..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all"
            >
              Soumettre mon dossier de vérification
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
