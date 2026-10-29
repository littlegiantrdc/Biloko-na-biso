import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Store,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Check,
  Eye,
  Star,
  Trash2,
  Sparkles,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export function AdminDashboard({ navigate }: AdminDashboardProps) {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'producers' | 'products' | 'users' | 'reviews' | 'messages' | 'audit'>('metrics');

  const [metrics, setMetrics] = useState<any>(null);
  const [producers, setProducers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Producer verification modal/action
  const [auditNote, setAuditNote] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'admin') return;
    loadAdminData();
  }, [token, user]);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [mRes, prRes, pRes, uRes, rRes, lRes, msgRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/producers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/reviews', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/contact-messages', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (mRes.ok) setMetrics(await mRes.json());
      if (prRes.ok) setProducers(await prRes.json());
      if (pRes.ok) setProducts(await pRes.json());
      if (uRes.ok) setUsersList(await uRes.json());
      if (rRes.ok) setReviewsList(await rRes.json());
      if (lRes.ok) setAuditLogs(await lRes.json());
      if (msgRes.ok) setContactMessages(await msgRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleProducerVerification(producerId: string, currentVerified: boolean) {
    const isVerified = !currentVerified;
    const notes = prompt(
      isVerified
        ? 'Précisez le justificatif contrôlé pour attribuer le badge Vérifié :'
        : 'Motif du retrait de la vérification :',
      'Contrôle RCCM & Statuts conformes'
    );
    if (notes === null) return;

    try {
      const res = await fetch(`/api/admin/producers/${producerId}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVerified, notes }),
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleUserStatus(userId: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Confirmer le passage du compte à l'état "${newStatus}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleProductFeature(productId: string, currentFeature: number) {
    const isFeatured = currentFeature === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isFeatured }),
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleMessageStatus(messageId: string, currentStatus: string) {
    const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
    try {
      const res = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteContactMessage(messageId: string) {
    if (!confirm('Supprimer définitivement ce message de contact ?')) return;
    try {
      const res = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold font-display text-stone-900">Accès Administrateur Restreint</h2>
        <p className="text-xs text-stone-600">Cette section est strictement réservée à l'équipe de gouvernance.</p>
        <button onClick={() => navigate('/connexion')} className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs">
          Connexion requise
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white">
              Panneau d'Administration — Biloko Na Biso
            </h1>
            <p className="text-xs text-stone-400">
              Gouvernance, modération, vérification des producteurs et audit sécurité
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60 self-start sm:self-auto">
          Connecté : {user.email}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'metrics' ? 'bg-indigo-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Vue générale & Indicateurs
        </button>

        <button
          onClick={() => setActiveTab('producers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'producers' ? 'bg-indigo-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Producteurs ({producers.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'products' ? 'bg-indigo-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Produits ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'users' ? 'bg-indigo-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Utilisateurs ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'reviews' ? 'bg-indigo-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Modération des avis ({reviewsList.length})
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'messages' ? 'bg-indigo-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Messages reçus ({contactMessages.length})
          {contactMessages.filter((m) => m.status === 'unread').length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {contactMessages.filter((m) => m.status === 'unread').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'audit' ? 'bg-indigo-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Journal d'audit
        </button>
      </div>

      {/* TAB 1: METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold">Producteurs enregistrés</span>
              <p className="text-3xl font-black text-stone-900 font-display">{metrics?.totalProducers || 0}</p>
              <span className="text-[10px] text-emerald-700 font-bold">{metrics?.verifiedProducers || 0} vérifiés avec badge</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold">Produits publiés</span>
              <p className="text-3xl font-black text-emerald-800 font-display">{metrics?.totalPublishedProducts || 0}</p>
              <span className="text-[10px] text-stone-400 font-medium">{metrics?.pendingProducts || 0} en attente</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold">Membres visiteurs</span>
              <p className="text-3xl font-black text-stone-900 font-display">{metrics?.totalMembers || 0}</p>
              <span className="text-[10px] text-stone-400 font-medium">Comptes actifs</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold">Avis signalés</span>
              <p className="text-3xl font-black text-rose-600 font-display">{metrics?.reportedReviews || 0}</p>
              <span className="text-[10px] text-stone-400 font-medium">À auditer</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCERS MANAGEMENT */}
      {activeTab === 'producers' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-bold text-stone-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Entreprise</th>
                  <th className="py-3 px-4">Province & Ville</th>
                  <th className="py-3 px-4">Secteur</th>
                  <th className="py-3 px-4">Statut de vérification</th>
                  <th className="py-3 px-4 text-right">Contrôle Vérifié</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {producers.map((pr) => (
                  <tr key={pr.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-stone-900">{pr.company_name}</span>
                        <p className="text-[10px] text-stone-400">{pr.manager_name} • {pr.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-700">{pr.city_territory}, {pr.province}</td>
                    <td className="py-3 px-4 text-stone-600">{pr.sector}</td>
                    <td className="py-3 px-4">
                      {Boolean(pr.is_verified) ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Badge accordé
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-stone-500 bg-stone-100">
                          Non vérifié
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleProducerVerification(pr.id, Boolean(pr.is_verified))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          Boolean(pr.is_verified)
                            ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                            : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                        }`}
                      >
                        {Boolean(pr.is_verified) ? 'Retirer badge' : 'Vérifier & Attribuer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS MODERATION */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-bold text-stone-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Produit</th>
                  <th className="py-3 px-4">Producteur</th>
                  <th className="py-3 px-4">Province</th>
                  <th className="py-3 px-4">À la une</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-bold text-stone-900">{p.name}</td>
                    <td className="py-3 px-4 text-stone-700">{p.producer_name}</td>
                    <td className="py-3 px-4 text-stone-600">{p.province}</td>
                    <td className="py-3 px-4">
                      {p.is_featured === 1 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          À la une
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleProductFeature(p.id, p.is_featured)}
                        className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-800"
                      >
                        {p.is_featured === 1 ? 'Retirer de la une' : 'Mettre à la une'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-bold text-stone-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-bold text-stone-900">{u.full_name}</td>
                    <td className="py-3 px-4 text-stone-700">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[10px] font-bold text-stone-600">{u.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-700 text-xs font-semibold text-stone-700 transition-colors"
                        >
                          {u.status === 'active' ? 'Suspendre' : 'Réactiver'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs divide-y divide-stone-100">
          {reviewsList.map((rev) => (
            <div key={rev.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-stone-900">{rev.user_name}</span>
                  <span className="text-[10px] text-stone-400">sur « {rev.product_name} »</span>
                  <div className="flex items-center text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs font-bold text-stone-800 ml-1">{rev.rating}/5</span>
                  </div>
                  {rev.is_reported === 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      Signalé par un utilisateur
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-700 mt-1">{rev.comment}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: CONTACT INQUIRIES & MESSAGES */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">
              Boîte de réception des messages envoyés à Little Giants (littlegiantrdc@gmail.com)
            </h3>
            <span className="text-xs text-stone-500">
              {contactMessages.length} message{contactMessages.length > 1 ? 's' : ''} au total
            </span>
          </div>

          {contactMessages.length > 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs divide-y divide-stone-100 overflow-hidden">
              {contactMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-6 transition-colors ${
                    msg.status === 'unread' ? 'bg-amber-50/40' : 'bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            msg.status === 'unread'
                              ? 'bg-amber-400 text-stone-950 font-black'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {msg.status === 'unread' ? 'Non lu' : 'Lu'}
                        </span>

                        {Boolean(msg.email_dispatched) && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            E-mail acheminé par SMTP
                          </span>
                        )}

                        <span className="text-xs text-stone-400">
                          {new Date(msg.created_at).toLocaleString('fr-FR', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-stone-900 font-display">
                        {msg.subject}
                      </h4>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                        <span className="font-semibold text-stone-800">
                          De : {msg.name}
                        </span>
                        <a
                          href={`mailto:${msg.email}?subject=Re:%20${encodeURIComponent(msg.subject)}`}
                          className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {msg.email}
                        </a>
                        {msg.phone && (
                          <a
                            href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {msg.phone}
                          </a>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-800 whitespace-pre-line leading-relaxed">
                        {msg.message}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center gap-2 shrink-0">
                      <a
                        href={`mailto:${msg.email}?subject=Re:%20${encodeURIComponent(msg.subject)}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Répondre par e-mail
                      </a>

                      {msg.phone && (
                        <a
                          href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 transition-colors border border-emerald-200"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          WhatsApp
                        </a>
                      )}

                      <button
                        onClick={() => handleToggleMessageStatus(msg.id, msg.status)}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors"
                      >
                        {msg.status === 'unread' ? 'Marquer comme lu' : 'Marquer comme non lu'}
                      </button>

                      <button
                        onClick={() => handleDeleteContactMessage(msg.id)}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Supprimer ce message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-2xs space-y-3">
              <Inbox className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="text-base font-bold text-stone-800">Aucun message de contact pour l'instant</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Tous les messages transmis depuis la rubrique « Contact » du site apparaîtront directement ici et seront envoyés à littlegiantrdc@gmail.com.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs divide-y divide-stone-100">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-stone-900">{log.action}</span>
                <span className="text-stone-500 ml-2">Type : {log.target_type}</span>
                {log.details && (
                  <p className="text-[11px] text-stone-600 mt-0.5">{log.details}</p>
                )}
              </div>
              <span className="text-stone-400 shrink-0">
                {new Date(log.created_at).toLocaleString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
