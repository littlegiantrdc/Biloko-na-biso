import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'biloko.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'visitor', -- 'visitor', 'producer', 'admin'
      full_name TEXT NOT NULL,
      avatar_url TEXT,
      phone TEXT,
      is_email_verified INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended'
      reset_token TEXT,
      reset_token_expires INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS producer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      manager_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp TEXT,
      email TEXT NOT NULL,
      sector TEXT NOT NULL,
      province TEXT NOT NULL,
      city_territory TEXT NOT NULL,
      address TEXT,
      description TEXT NOT NULL,
      story TEXT,
      mission_values TEXT,
      production_methods TEXT,
      founding_year INTEGER,
      logo_url TEXT,
      banner_url TEXT,
      website_url TEXT,
      facebook TEXT,
      instagram TEXT,
      linkedin TEXT,
      accepts_wholesale INTEGER NOT NULL DEFAULT 1,
      accepts_distribution INTEGER NOT NULL DEFAULT 1,
      is_verified INTEGER NOT NULL DEFAULT 0,
      verification_status TEXT NOT NULL DEFAULT 'none', -- 'none', 'pending', 'verified', 'rejected'
      verification_notes TEXT,
      views_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      producer_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT NOT NULL,
      full_description TEXT NOT NULL,
      category_id TEXT NOT NULL,
      sub_category TEXT,
      province TEXT NOT NULL,
      city_territory TEXT NOT NULL,
      production_type TEXT NOT NULL, -- 'agricole', 'artisanal', 'transforme', 'manufacture', 'autre'
      raw_materials TEXT,
      manufacturing_process TEXT,
      packaging_variants TEXT,
      price_indicative REAL,
      currency TEXT NOT NULL DEFAULT 'USD', -- 'USD', 'CDF'
      availability TEXT NOT NULL DEFAULT 'available', -- 'available', 'on_order', 'seasonal', 'out_of_stock'
      wholesale_available INTEGER NOT NULL DEFAULT 1,
      retail_available INTEGER NOT NULL DEFAULT 1,
      certifications_labels TEXT,
      status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'pending', 'published', 'rejected', 'archived'
      rejection_reason TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      views_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      is_moderated INTEGER NOT NULL DEFAULT 1,
      is_reported INTEGER NOT NULL DEFAULT 0,
      report_reason TEXT,
      producer_reply TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(product_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS contact_requests (
      id TEXT PRIMARY KEY,
      producer_id TEXT NOT NULL,
      product_id TEXT,
      sender_name TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      sender_phone TEXT,
      request_type TEXT NOT NULL, -- 'achat', 'distribution', 'partenariat', 'approvisionnement', 'information', 'autre'
      estimated_quantity TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new', -- 'new', 'read', 'in_progress', 'closed'
      created_at INTEGER NOT NULL,
      FOREIGN KEY(producer_id) REFERENCES producer_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS content_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      category TEXT NOT NULL,
      author_name TEXT NOT NULL,
      producer_id TEXT,
      read_time TEXT NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 1,
      published_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread', -- 'unread', 'read', 'archived'
      email_dispatched INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  seedInitialData();
}

// Scrypt password hashing
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

function seedInitialData() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM categories');
  const res = countStmt.get() as { count: number };
  if (res && res.count > 0) {
    return; // Already seeded
  }

  const now = Date.now();

  // 1. Initial Categories (from project specifications)
  const categories = [
    { id: 'cat-agri', name: 'Agriculture et céréales', slug: 'agriculture-et-cereales', icon: 'Wheat', desc: 'Manioc, maïs, riz local, arachides, sésame et graines congolaises.', order: 1 },
    { id: 'cat-fruits', name: 'Fruits et légumes', slug: 'fruits-et-legumes', icon: 'Apple', desc: 'Avocats, bananes plantains, ananas de Mayumbe, mangues et légumes maraîchers.', order: 2 },
    { id: 'cat-cafe-cacao', name: 'Café, cacao et produits de plantation', slug: 'cafe-cacao-plantation', icon: 'Coffee', desc: 'Cafés Arabica et Robusta d’altitude du Kivu et de l’Ituri, fèves de cacao grand cru.', order: 3 },
    { id: 'cat-transfo', name: 'Produits alimentaires transformés', slug: 'alimentaires-transformes', icon: 'UtensilsCrossed', desc: 'Chocolats fins de terroir, confitures artisanales, farines panifiables fortifiées.', order: 4 },
    { id: 'cat-boissons', name: 'Boissons et produits naturels', slug: 'boissons-naturelles', icon: 'CupSoda', desc: 'Jus tropicaux pressés, infusions de kinkeliba, bissap local et miels sauvages.', order: 5 },
    { id: 'cat-elevage', name: 'Élevage et produits dérivés', slug: 'elevage-et-derives', icon: 'Beef', desc: 'Miels de montagne, produits laitiers traditionnels et aviculture locale.', order: 6 },
    { id: 'cat-artisanat', name: 'Artisanat et objets faits main', slug: 'artisanat-fait-main', icon: 'Palette', desc: 'Sculptures sur bois précieux, vannerie traditionnelle, céramiques et poteries.', order: 7 },
    { id: 'cat-textile', name: 'Textiles, vêtements et accessoires', slug: 'textiles-vetements-accessoires', icon: 'Shirt', desc: 'Tissus en raphia Kuba, pagnes tissés, maroquinerie locale et créations de mode.', order: 8 },
    { id: 'cat-cosmetique', name: 'Cosmétique et soins fabriqués localement', slug: 'cosmetique-soins-locaux', icon: 'Sparkles', desc: 'Beurres de karité purs, huiles végétales de coco et d’avocat, savons surgras.', order: 9 },
    { id: 'cat-mobilier', name: 'Mobilier et décoration maison', slug: 'mobilier-decoration', icon: 'Armchair', desc: 'Meubles en bois massif congolais (ébène, wengé), luminaires et objets décoratifs.', order: 10 },
    { id: 'cat-materiaux', name: 'Matériaux et produits de construction', slug: 'materiaux-construction', icon: 'Hammer', desc: 'Briques stabilisées, dalles locales, bois d’œuvre durable et chaux vive.', order: 11 },
    { id: 'cat-manufacture', name: 'Emballages et produits manufacturés', slug: 'emballages-manufactures', icon: 'Package', desc: 'Emballages biodégradables, sacs en fibres de bananier et contenants durables.', order: 12 },
    { id: 'cat-autres', name: 'Autres produits congolais', slug: 'autres-produits-congolais', icon: 'Boxes', desc: 'Innovations et créations diverses issues du savoir-faire congolais.', order: 13 },
  ];

  const catInsert = db.prepare(`
    INSERT INTO categories (id, name, slug, description, icon, display_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  for (const c of categories) {
    catInsert.run(c.id, c.name, c.slug, c.desc, c.icon, c.order);
  }

  // 2. Default Administrator Account (strictly protected)
  // Admin credentials: admin@bilokonabiso.cd / BilokoRDC2026!
  const adminPass = hashPassword('BilokoRDC2026!');
  const adminId = 'usr-admin-01';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, role, full_name, phone, is_email_verified, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'admin', 'Administrateur Principal', '+243858960478', 1, 'active', ?, ?)
  `).run(adminId, 'admin@bilokonabiso.cd', adminPass.hash, adminPass.salt, now, now);

  // 3. Platform Settings
  const settingsInsert = db.prepare(`
    INSERT INTO platform_settings (key, value, updated_at) VALUES (?, ?, ?)
  `);
  settingsInsert.run('platform_name', 'Biloko Na Biso', now);
  settingsInsert.run('platform_slogan', 'Le savoir-faire congolais, à portée du monde.', now);
  settingsInsert.run('contact_email', 'littlegiantrdc@gmail.com', now);
  settingsInsert.run('whatsapp_number', '+243858960478', now);
  settingsInsert.run('owner_entity', 'Little Giants', now);
  settingsInsert.run('owner_url', 'https://littlegiantrdc.netlify.app/', now);
  settingsInsert.run('enable_user_registration', 'true', now);
  settingsInsert.run('enable_producer_registration', 'true', now);
  settingsInsert.run('moderate_reviews_before_publish', 'false', now);

  console.log('Database initialized in virgin production-ready state (categories & admin configured).');
}
