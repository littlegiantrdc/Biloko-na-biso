import React from 'react';
import { HelpCircle, Shield, FileText, CheckCircle2 } from 'lucide-react';

export function FAQPage() {
  const faqs = [
    {
      q: 'Qu’est-ce que Biloko Na Biso ?',
      a: 'Biloko Na Biso est la plateforme professionnelle dédiée à la mise en valeur des produits locaux fabriqués ou transformés en République Démocratique du Congo. Elle permet aux producteurs de créer leur vitrine et au public de découvrir et commander directement auprès d’eux.',
    },
    {
      q: 'La plateforme prélève-t-elle des commissions sur les ventes ?',
      a: 'Non. Biloko Na Biso est un annuaire et catalogue de mise en relation directe. Les transactions, devis et approvisionnements se font directement entre le producteur et l’acheteur (par WhatsApp, appel ou e-mail), sans commission obligatoire.',
    },
    {
      q: 'Comment un producteur obtient-il le badge « Vérifié » ?',
      a: 'Le badge vérifié n’est jamais attribué automatiquement. Le producteur doit soumettre ses documents légaux (RCCM, Id. Nat, attestation OCC ou documents de coopérative) qui sont audités par l’équipe administrative avant validation.',
    },
    {
      q: 'Qui est Little Giants ?',
      a: 'Little Giants est l’entité initiatrice et propriétaire de Biloko Na Biso. Vous pouvez visiter le site officiel : https://littlegiantrdc.netlify.app/ ou contacter l’équipe au +243 858 960 478.',
    },
    {
      q: 'Comment un producteur peut-il s’inscrire ?',
      a: 'Il suffit de cliquer sur « Devenir producteur » et de renseigner les informations de son entreprise, sa province et son activité. L’inscription est gratuite.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
          Assistance & Questions fréquentes
        </span>
        <h1 className="text-3xl font-black text-stone-900 font-display">Foire Aux Questions (FAQ)</h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              {faq.q}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed pl-6">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PublicationGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full">
          Éthique & Normes
        </span>
        <h1 className="text-3xl font-black text-stone-900 font-display">Règles de Publication</h1>
        <p className="text-xs text-stone-500">Dernière mise à jour : 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-stone-200 space-y-6 text-xs text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">1. Critère d'Origine Réelle en RDC</h2>
          <p>
            Pour figurer sur Biloko Na Biso, les produits doivent être soit récoltés, élevés, transformés, manufacturés ou conçus de façon substantielle en République Démocratique du Congo. La simple revente de produits 100% importés n'ayant subi aucune transformation locale n'est pas admise.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">2. Interdiction des Faux Avis et Fausses Certifications</h2>
          <p>
            Tout producteur tentant de publier de faux avis sur ses propres produits ou d'attribuer des certifications sanitaires inexistantes sera immédiatement suspendu. Le badge « Producteur Vérifié » fait l'objet d'un contrôle administratif strict.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">3. Transparence des Prix</h2>
          <p>
            Lorsqu'un prix n'est pas fixe ou dépend des quantités en gros, il doit être clairement indiqué que le tarif est sur devis (« Contacter le producteur pour le prix »).
          </p>
        </section>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-black text-stone-900 font-display">Conditions Générales d'Utilisation</h1>
      <div className="bg-white rounded-3xl p-8 border border-stone-200 space-y-4 text-xs text-stone-700 leading-relaxed">
        <p>
          Biloko Na Biso est édité par Little Giants (RDC). L'utilisation du site implique l'acceptation pleine et entière des présentes conditions générales.
        </p>
        <p>
          La plateforme a pour objet la mise en relation entre producteurs congolais et acheteurs. Biloko Na Biso n'intervient pas dans les contrats de vente conclus directement entre les parties.
        </p>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-black text-stone-900 font-display">Politique de Confidentialité</h1>
      <div className="bg-white rounded-3xl p-8 border border-stone-200 space-y-4 text-xs text-stone-700 leading-relaxed">
        <p>
          La protection des données personnelles de nos utilisateurs et producteurs est une priorité absolue. Nous collectons uniquement les informations nécessaires au fonctionnement du service et à la mise en relation commerciale.
        </p>
        <p>
          Aucune donnée personnelle n'est vendue à des tiers. Les producteurs et membres peuvent à tout moment demander la modification ou la suppression définitive de leur compte conformément aux réglementations applicables.
        </p>
      </div>
    </div>
  );
}
