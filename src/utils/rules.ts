// Pure logic rules and calculations for Biloko Na Biso

export interface PriceInfo {
  amount?: number | null;
  currency?: 'USD' | 'CDF' | string;
}

export interface ReviewRating {
  rating: number;
}

export interface ProducerInput {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  category: string;
  province: string;
  phone: string;
}

/**
 * Computes average rating and total count from review list.
 */
export function calculateRatingAverage(reviews: ReviewRating[]): { average: number; count: number } {
  if (!reviews || reviews.length === 0) {
    return { average: 0, count: 0 };
  }
  const valid = reviews.filter(r => typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5);
  if (valid.length === 0) {
    return { average: 0, count: 0 };
  }
  const sum = valid.reduce((acc, curr) => acc + curr.rating, 0);
  const avg = Math.round((sum / valid.length) * 10) / 10;
  return { average: avg, count: valid.length };
}

/**
 * Formats indicative Congolese prices in USD or CDF.
 * If price is not specified or 0, returns the user-mandated text: "Contacter le producteur pour le prix".
 */
export function formatCongolesePrice(amount?: number | null, currency: string = 'USD'): string {
  if (amount === undefined || amount === null || amount <= 0) {
    return 'Contacter le producteur pour le prix';
  }

  const formattedNum = new Intl.NumberFormat('fr-CD', {
    maximumFractionDigits: currency === 'CDF' ? 0 : 2,
    minimumFractionDigits: currency === 'CDF' ? 0 : 2,
  }).format(amount);

  return `${formattedNum} ${currency.toUpperCase()}`;
}

/**
 * Converts a phone number to an international WhatsApp compatible format and generates standard link.
 */
export function formatWhatsAppLink(phone: string, text?: string): string {
  if (!phone) return '';
  // Clean non digits
  let cleaned = phone.replace(/[^0-9]/g, '');
  // If starts with 0 for DRC local numbers (e.g., 0858960478 -> 243858960478)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '243' + cleaned.substring(1);
  } else if (!cleaned.startsWith('243') && cleaned.length === 9) {
    cleaned = '243' + cleaned;
  }
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${cleaned}${query}`;
}

/**
 * Validates producer registration input fields.
 */
export function validateProducerRegistration(data: Partial<ProducerInput>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Le nom complet du responsable est requis.');
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Une adresse e-mail valide est requise.');
  }
  if (!data.password || data.password.length < 6) {
    errors.push('Le mot de passe doit comporter au moins 6 caractères.');
  }
  if (!data.companyName || data.companyName.trim().length < 2) {
    errors.push("Le nom de l'entreprise ou coopérative est requis.");
  }
  if (!data.category) {
    errors.push("La catégorie d'activité principale est requise.");
  }
  if (!data.province) {
    errors.push('La province de localisation est requise.');
  }
  if (!data.phone || data.phone.replace(/[^0-9]/g, '').length < 8) {
    errors.push('Un numéro de téléphone valide est requis.');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Filters a product array by category, province, and search query.
 */
export function filterProducts<T extends { name: string; category: string; province: string; description?: string }>(
  products: T[],
  filters: { category?: string; province?: string; search?: string }
): T[] {
  return products.filter(p => {
    if (filters.category && filters.category !== 'all' && p.category.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
    if (filters.province && filters.province !== 'all' && p.province.toLowerCase() !== filters.province.toLowerCase()) {
      return false;
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });
}

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

/**
 * Validates public contact form fields.
 */
export function validateContactMessage(input: Partial<ContactMessageInput>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input.name || input.name.trim().length < 2) {
    errors.push('Le nom est obligatoire (minimum 2 caractères).');
  }
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.push('Une adresse e-mail valide est obligatoire pour que nous puissions vous répondre.');
  }
  if (!input.subject || input.subject.trim().length < 3) {
    errors.push("L'objet du message est obligatoire.");
  }
  if (!input.message || input.message.trim().length < 10) {
    errors.push('Le contenu de votre message est obligatoire (minimum 10 caractères).');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates a pre-filled mailto link for direct transmission to Little Giants.
 */
export function formatContactMailtoUrl(
  input: ContactMessageInput,
  recipient: string = 'littlegiantrdc@gmail.com'
): string {
  const body = `Nom : ${input.name.trim()}
E-mail : ${input.email.trim()}
Téléphone : ${input.phone ? input.phone.trim() : 'Non précisé'}

Message :
${input.message.trim()}

---
Envoyé depuis la plateforme Biloko Na Biso`;

  return `mailto:${recipient}?subject=${encodeURIComponent('[Biloko Na Biso] ' + input.subject.trim())}&body=${encodeURIComponent(body)}`;
}

