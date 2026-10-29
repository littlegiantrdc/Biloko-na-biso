import React, { useState } from 'react';
import { LogIn, Sparkles, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Store, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  navigate: (path: string) => void;
}

export function LoginPage({ navigate }: AuthPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Identifiants invalides.');
    }
  }

  // Quick fill helper for effortless demo testing as requested in section 24
  function fillDemo(eMail: string, pass: string) {
    setEmail(eMail);
    setPassword(pass);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 p-2 mx-auto shadow-xs">
          <img src="/logo-transparent.png" alt="Biloko Na Biso" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 font-display">Connexion à votre compte</h1>
        <p className="text-xs text-stone-500">Accédez à votre espace membre, producteur ou administration</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Adresse e-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre-email@exemple.cd"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700">Mot de passe</label>
              <button
                type="button"
                onClick={() => navigate('/mot-de-passe-oublie')}
                className="text-[11px] font-semibold text-emerald-800 hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Quick Testing Demo Accounts */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider text-center">
            Comptes de démonstration pré-configurés
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('contact@coopackivu.cd', 'Producer2026!')}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-left transition-colors flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Producteur Kivu</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@bilokonabiso.cd', 'BilokoRDC2026!')}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold text-left transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <span>Administrateur</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-stone-600 pt-2">
          Pas encore de compte ?{' '}
          <button onClick={() => navigate('/inscription')} className="text-emerald-800 font-bold hover:underline">
            S'inscrire comme visiteur
          </button>
          {' ou '}
          <button onClick={() => navigate('/inscription-producteur')} className="text-amber-700 font-bold hover:underline">
            Devenir producteur
          </button>
        </div>
      </div>
    </div>
  );
}

export function RegisterMemberPage({ navigate }: AuthPageProps) {
  const { registerVisitor } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await registerVisitor({ fullName, email, phone, password });
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Erreur lors de l’inscription.');
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-stone-900 font-display">Créer un compte membre</h1>
        <p className="text-xs text-stone-500">Pour enregistrer vos favoris et laisser des avis authentiques</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Nom complet *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex : Marie-Claire Mwamba"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Adresse e-mail *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre-email@exemple.cd"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Téléphone (facultatif)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+243..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Mot de passe * (min 6 caractères)</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Création en cours...' : 'Créer mon compte membre'}
          </button>
        </form>

        <div className="text-center text-xs text-stone-600 pt-2 border-t border-stone-100">
          Déjà un compte ?{' '}
          <button onClick={() => navigate('/connexion')} className="text-emerald-800 font-bold hover:underline">
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}

export function RegisterProducerPage({ navigate }: AuthPageProps) {
  const { registerProducer } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('Café, cacao et autres produits de plantation');
  const [province, setProvince] = useState('Kinshasa');
  const [cityTerritory, setCityTerritory] = useState('');
  const [description, setDescription] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!termsAccepted) {
      setError('Veuillez accepter les conditions d’utilisation.');
      return;
    }
    setError(null);
    setLoading(true);

    const res = await registerProducer({
      fullName,
      email,
      phone,
      password,
      companyName,
      sector,
      province,
      cityTerritory,
      description,
      termsAccepted: true,
    });

    setLoading(false);
    if (res.success) {
      navigate('/producteur/dashboard');
    } else {
      setError(res.error || 'Erreur lors de l’inscription producteur.');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
          Espace Entreprises & Coopératives
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
          Inscription Producteur & Entreprise Locale
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Rejoignez la vitrine nationale des producteurs de la RDC et donnez une visibilité professionnelle à vos produits.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-md space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-stone-100">
              1. Informations sur le responsable
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nom et prénom du responsable *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex : Dieudonné Mwamba"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Numéro de téléphone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+243..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Adresse e-mail professionnelle *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@entreprise.cd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mot de passe sécurisé *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-stone-100">
              2. Informations sur l'entreprise ou la coopérative
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Nom de l'entreprise, marque ou coopérative *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex : Coopérative Caféière du Kivu (COOPAC)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Province (RDC) *</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none"
                >
                  <option value="Kinshasa">Kinshasa</option>
                  <option value="Nord-Kivu">Nord-Kivu</option>
                  <option value="Sud-Kivu">Sud-Kivu</option>
                  <option value="Tshopo">Tshopo</option>
                  <option value="Ituri">Ituri</option>
                  <option value="Kwilu">Kwilu</option>
                  <option value="Kasaï">Kasaï</option>
                  <option value="Kasaï-Central">Kasaï-Central</option>
                  <option value="Kasaï-Oriental">Kasaï-Oriental</option>
                  <option value="Haut-Katanga">Haut-Katanga</option>
                  <option value="Lualaba">Lualaba</option>
                  <option value="Kongo Central">Kongo Central</option>
                  <option value="Équateur">Équateur</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Ville ou Territoire</label>
                <input
                  type="text"
                  value={cityTerritory}
                  onChange={(e) => setCityTerritory(e.target.value)}
                  placeholder="Ex : Goma / Territoire de Masisi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Catégorie d'activité principale *</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none"
              >
                <option value="Agriculture et céréales">Agriculture et céréales</option>
                <option value="Fruits et légumes">Fruits et légumes</option>
                <option value="Café, cacao et autres produits de plantation">Café, cacao et autres produits de plantation</option>
                <option value="Produits alimentaires transformés">Produits alimentaires transformés</option>
                <option value="Boissons et produits naturels">Boissons et produits naturels</option>
                <option value="Élevage et produits dérivés">Élevage et produits dérivés</option>
                <option value="Artisanat et objets faits main">Artisanat et objets faits main</option>
                <option value="Textiles, vêtements et accessoires">Textiles, vêtements et accessoires</option>
                <option value="Cosmétique et soins fabriqués localement">Cosmétique et soins fabriqués localement</option>
                <option value="Mobilier, décoration et articles pour la maison">Mobilier, décoration et articles pour la maison</option>
                <option value="Matériaux et produits de construction">Matériaux et produits de construction</option>
                <option value="Emballages et produits manufacturés">Emballages et produits manufacturés</option>
                <option value="Autres produits congolais">Autres produits congolais</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Description initiale de l'activité</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Présentez brièvement vos produits, vos spécialités et vos capacités de production..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 rounded text-emerald-700 focus:ring-emerald-700 h-4 w-4"
            />
            <label htmlFor="terms" className="text-xs text-stone-600 leading-normal">
              J'atteste sur l'honneur que les produits présentés sont cultivés, transformés ou fabriqués en République Démocratique du Congo, et j'accepte les conditions d'utilisation et la politique de confidentialité.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {loading ? 'Création du compte producteur...' : 'Créer mon compte producteur'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function ForgotPasswordPage({ navigate }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ message: string; resetUrl?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ message: 'Erreur réseau.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-stone-900 font-display">Mot de passe oublié</h1>
        <p className="text-xs text-stone-500">Saisissez votre e-mail pour recevoir les instructions de réinitialisation</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-md space-y-4">
        {result ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="text-xs text-stone-700 leading-relaxed">{result.message}</p>
            {result.resetUrl && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <p className="font-bold text-emerald-900 mb-1">Lien de test généré :</p>
                <button
                  onClick={() => navigate(result.resetUrl!)}
                  className="text-emerald-700 underline font-semibold break-all text-left"
                >
                  Accéder à l'écran de réinitialisation
                </button>
              </div>
            )}
            <button
              onClick={() => navigate('/connexion')}
              className="w-full py-2.5 rounded-xl bg-stone-100 text-xs font-bold text-stone-700 hover:bg-stone-200"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Votre adresse e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@exemple.cd"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors"
            >
              {loading ? 'Traitement...' : 'Générer le lien de réinitialisation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function ResetPasswordPage({ navigate }: AuthPageProps) {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Erreur lors de la réinitialisation.');
      }
    } catch {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-stone-900 font-display">Nouveau mot de passe</h1>
        <p className="text-xs text-stone-500">Choisissez un mot de passe sécurisé pour votre compte</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-md space-y-4">
        {success ? (
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-stone-900">Mot de passe réinitialisé !</h3>
            <p className="text-xs text-stone-600">Vous pouvez désormais vous connecter avec votre nouveau mot de passe.</p>
            <button
              onClick={() => navigate('/connexion')}
              className="w-full py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold"
            >
              Se connecter maintenant
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Nouveau mot de passe (min 6 car.)</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-800 text-white font-bold text-xs"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
