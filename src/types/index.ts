export interface User {
  id: string;
  email: string;
  role: 'visitor' | 'producer' | 'admin';
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  producerId?: string | null;
  producerCompany?: string | null;
  producerSlug?: string | null;
  isVerified?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: number;
  display_order: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_moderated: number;
  is_reported: number;
  report_reason?: string;
  producer_reply?: string;
  created_at: number;
  author_name?: string;
  author_avatar?: string;
}

export interface Product {
  id: string;
  producer_id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  sub_category?: string;
  province: string;
  city_territory: string;
  production_type: 'agricole' | 'artisanal' | 'transforme' | 'manufacture' | 'autre';
  raw_materials?: string;
  manufacturing_process?: string;
  packaging_variants?: string;
  price_indicative?: number | null;
  currency: 'USD' | 'CDF';
  availability: 'available' | 'on_order' | 'seasonal' | 'out_of_stock';
  wholesale_available: number;
  retail_available: number;
  certifications_labels?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
  rejection_reason?: string;
  is_featured: number;
  views_count: number;
  created_at: number;
  primary_image?: string;
  images?: ProductImage[];
  producer_name?: string;
  producer_slug?: string;
  producer_verified?: number;
  producer_logo?: string;
  producer_phone?: string;
  producer_whatsapp?: string;
  producer_email?: string;
  producer_city?: string;
  producer_province?: string;
  review_count?: number;
  average_rating?: number;
  reviews?: Review[];
  directWhatsAppUrl?: string;
}

export interface Producer {
  id: string;
  user_id: string;
  company_name: string;
  slug: string;
  manager_name: string;
  phone: string;
  whatsapp?: string;
  email: string;
  sector: string;
  province: string;
  city_territory: string;
  address?: string;
  description: string;
  story?: string;
  mission_values?: string;
  production_methods?: string;
  founding_year?: number;
  logo_url?: string;
  banner_url?: string;
  website_url?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  accepts_wholesale: number;
  accepts_distribution: number;
  is_verified: number;
  verification_status: 'none' | 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  views_count: number;
  product_count?: number;
  overallRating?: number;
  totalReviews?: number;
  products?: Product[];
  directWhatsAppUrl?: string;
  created_at: number;
}

export interface ContactRequest {
  id: string;
  producer_id: string;
  product_id?: string;
  product_name?: string;
  product_slug?: string;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  request_type: 'achat' | 'distribution' | 'partenariat' | 'approvisionnement' | 'information' | 'autre';
  estimated_quantity?: string;
  message: string;
  status: 'new' | 'read' | 'in_progress' | 'closed';
  created_at: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author_name: string;
  read_time: string;
  published_at: number;
}
