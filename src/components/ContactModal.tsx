import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Building2, Package } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  producerId: string;
  producerName: string;
  productId?: string;
  productName?: string;
}

export function ContactModal({
  isOpen,
  onClose,
  producerId,
  producerName,
  productId,
  productName,
}: ContactModalProps) {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [requestType, setRequestType] = useState<'achat' | 'distribution' | 'partenariat' | 'approvisionnement' | 'information' | 'autre'>('achat');
  const [estimatedQuantity, setEstimatedQuantity] = useState('');
  const [message, setMessage] = useState(
    productName
      ? `Bonjour, je souhaiterais obtenir des informations et un devis concernant le produit "${productName}".`
      : `Bonjour, je souhaiterais entrer en contact avec votre entreprise.`
  );
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError('Veuillez accepter les règles de confidentialité avant de transmettre votre demande.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/contact-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producerId,
          productId: productId || null,
          senderName,
          senderEmail,
          senderPhone,
          requestType,
          estimatedQuantity,
          message,
          consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l’envoi de votre demande.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Erreur réseau lors de la transmission. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  function handleResetAndClose() {
    setSuccess(false);
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Fermer la boîte de dialogue"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-display">
              Demande transmise avec succès !
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
              Votre message a été transmis directement à <strong>{producerName}</strong>. Le producteur prendra contact avec vous par e-mail ou téléphone sous peu.
            </p>
            <div className="pt-4">
              <button
                onClick={handleResetAndClose}
                className="w-full py-3 px-6 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-900 transition-colors shadow-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                Mise en relation directe
              </span>
              <h2 className="text-xl font-black text-stone-900 mt-2 font-display">
                Contacter le producteur
              </h2>
              <div className="flex flex-col gap-1 mt-1 text-xs text-stone-600">
                <span className="flex items-center gap-1.5 font-semibold text-stone-800">
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  {producerName}
                </span>
                {productName && (
                  <span className="flex items-center gap-1.5 text-stone-600">
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    Produit concerné : {productName}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Votre nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ex : Joseph Kasavubu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Adresse e-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="contact@entreprise.cd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Téléphone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+243..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Type de demande *
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm bg-white"
                  >
                    <option value="achat">Achat / Commande directe</option>
                    <option value="distribution">Distribution commerciale</option>
                    <option value="partenariat">Proposition de partenariat</option>
                    <option value="approvisionnement">Approvisionnement régulier (B2B)</option>
                    <option value="information">Demande d'information</option>
                    <option value="autre">Autre demande</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Quantité estimée (facultatif)
                  </label>
                  <input
                    type="text"
                    value={estimatedQuantity}
                    onChange={(e) => setEstimatedQuantity(e.target.value)}
                    placeholder="Ex : 50 kg / 100 unités"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Votre message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre besoin, les délais souhaités ou les détails de votre demande..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm resize-none"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 rounded text-emerald-700 focus:ring-emerald-700 h-4 w-4"
                />
                <label htmlFor="consent" className="text-xs text-stone-600 leading-normal">
                  J'accepte que mes coordonnées soient transmises à ce producteur dans le cadre strict de cette mise en relation professionnelle.
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Transmission en cours...' : 'Envoyer la demande'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
