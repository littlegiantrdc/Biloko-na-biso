import React, { useState } from 'react';
import {
  ShieldCheck,
  Target,
  HeartHandshake,
  MapPin,
  ExternalLink,
  Mail,
  Phone,
  MessageCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export function AboutPage({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full">
          Mission & Vision Nationale
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 font-display tracking-tight">
          Biloko Na Biso : Le savoir-faire congolais, à portée du monde
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Une plateforme professionnelle conçue pour référencer, promouvoir et connecter les producteurs, artisans, coopératives et transformateurs de la République Démocratique du Congo.
        </p>
      </div>

      {/* Main Image Banner */}
      <div className="relative aspect-21/9 rounded-3xl overflow-hidden shadow-xl border border-stone-200">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=80"
          alt="Agriculture en RDC"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-stone-900/80 via-transparent to-transparent flex items-end p-8">
          <p className="text-white text-sm sm:text-base font-medium max-w-xl">
            De Kinshasa à Lubumbashi, de Goma à Kisangani et Matadi, notre terre regorge de richesses prêtes à transformer l'Afrique.
          </p>
        </div>
      </div>

      {/* Core Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-display">Visibilité unifiée</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Centraliser les acteurs économiques congolais sur un annuaire numérique crédible, accessible aux acheteurs locaux, à la diaspora et aux marchés internationaux.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-display">Traçabilité & Confiance</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Ne pas prétendre que tout est certifié sans contrôle : un processus de vérification rigoureux distingue les entreprises ayant fourni des justificatifs authentiques.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-display">Mise en relation directe</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Mettre en relation sans intermédiaire financier forcé les acheteurs, grossistes et producteurs, notamment via WhatsApp et formulaires sécurisés.
          </p>
        </div>
      </div>

      {/* Little Giants Ownership Section */}
      <div className="p-8 sm:p-10 rounded-3xl bg-emerald-950 text-white space-y-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            Propriété intellectuelle & Développement
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
            « Biloko Na Biso est un produit de Little Giants. »
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-2xl">
            Little Giants est une structure congolaise dédiée à l'innovation numérique, à l'entrepreneuriat et à la création de plateformes technologiques durables au service du développement socio-économique de la RDC.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold">
            <a
              href="https://littlegiantrdc.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              Visiter le site de Little Giants
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://wa.me/243858960478"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp Little Giants : +243 858 960 478
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentResult, setSentResult] = useState<{
    messageId: string;
    mailtoUrl: string;
    whatsappUrl: string;
    emailDispatched: boolean;
    targetEmail: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la transmission du message.');
      } else {
        setSentResult({
          messageId: data.messageId,
          mailtoUrl: data.mailtoUrl,
          whatsappUrl: data.whatsappUrl,
          emailDispatched: data.emailDispatched,
          targetEmail: data.targetEmail || 'littlegiantrdc@gmail.com',
        });
      }
    } catch {
      setError('Erreur de connexion avec le serveur. Veuillez vérifier votre réseau ou nous joindre directement.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
    setSentResult(null);
    setError(null);
  }

  function handleCopySummary() {
    const summary = `Message envoyé à Little Giants (littlegiantrdc@gmail.com) :\nNom : ${name}\nEmail : ${email}\nTél : ${phone || 'Non renseigné'}\nObjet : ${subject}\n\nMessage :\n${message}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
          Contactez-nous
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-display">
          Entrez en contact avec l'équipe de Biloko Na Biso
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Une question sur la plateforme, une demande de partenariat institutionnel ou une assistance pour votre inscription ? Écrivez directement aux responsables de Little Giants.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-display">Coordonnées officielles</h3>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">Siège du projet :</p>
                  <p>Kinshasa, République Démocratique du Congo</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">E-mail officiel de réception :</p>
                  <a
                    href="mailto:littlegiantrdc@gmail.com"
                    className="text-emerald-800 font-bold hover:underline block text-sm"
                  >
                    littlegiantrdc@gmail.com
                  </a>
                  <span className="text-[11px] text-stone-400">Réception directe de tous vos messages</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">Ligne directe & WhatsApp :</p>
                  <a
                    href="https://wa.me/243858960478"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-800 font-bold hover:underline flex items-center gap-1 text-sm"
                  >
                    +243 858 960 478
                  </a>
                  <span className="text-[11px] text-stone-400">Assistance rapide 7j/7</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <a
                href="https://wa.me/243858960478"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                Ouvrir une discussion WhatsApp
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600 space-y-2">
            <p className="font-bold text-stone-900">Vous êtes producteur ou artisan ?</p>
            <p>
              Pour présenter votre entreprise et vos produits sur Biloko Na Biso, vous pouvez directement créer votre compte en quelques minutes sans frais dans la rubrique « Inscription Producteur ».
            </p>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-stone-200/90 shadow-2xs">
          {sentResult ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-stone-900 font-display">
                  Message enregistré avec succès !
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                  Votre message a bien été pris en compte par la plateforme Biloko Na Biso pour l'équipe Little Giants (<strong className="text-stone-900">{sentResult.targetEmail}</strong>).
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-[11px] font-mono font-bold">
                  Identifiant : #{sentResult.messageId.slice(0, 12)}
                </div>
              </div>

              {/* Instant dispatch options guaranteeing email reception */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Garantie de transmission immédiate :
                </p>

                {/* Direct email dispatch via user's email client */}
                <a
                  href={sentResult.mailtoUrl}
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Mail className="w-4 h-4 text-amber-400" />
                  Ouvrir dans votre messagerie e-mail (copie directe)
                </a>

                {/* Direct WhatsApp dispatch */}
                <a
                  href={sentResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Envoyer aussi ce message par WhatsApp (+243 858 960 478)
                </a>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleCopySummary}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Résumé copié !' : 'Copier le résumé'}
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Nouveau message
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Envoyez-nous un message
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tous les messages sont transmis directement à <strong className="text-emerald-900">littlegiantrdc@gmail.com</strong>.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Votre nom *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Pascaline Luvuezo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Adresse e-mail *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@domaine.cd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Téléphone / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+243..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Objet du message *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Demande d'information / Partenariat / Question sur Biloko Na Biso"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Votre message *</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Envoi en cours...' : 'Transmettre mon message à littlegiantrdc@gmail.com'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

