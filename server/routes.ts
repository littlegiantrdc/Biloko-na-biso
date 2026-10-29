import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db, hashPassword, verifyPassword } from './db';
import {
  AuthRequest,
  createSession,
  destroySession,
  requireAuth,
  requireProducer,
  requireAdmin,
  logAdminAction,
} from './auth';
import { formatWhatsAppLink } from '../src/utils/rules';
import { sendContactEmail } from './mailer';

export const apiRouter = express.Router();
apiRouter.use(express.json({ limit: '15mb' }));

// Ensure upload directory exists
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Congolese 26 provinces constant
const DRC_PROVINCES = [
  'Kinshasa', 'Kongo Central', 'Kwango', 'Kwilu', 'Mai-Ndombe',
  'Kasaï', 'Kasaï-Central', 'Kasaï-Oriental', 'Lomami', 'Sankuru',
  'Haut-Katanga', 'Haut-Lomami', 'Lualaba', 'Tanganyika',
  'Maniema', 'Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Haut-Uele', 'Bas-Uele', 'Tshopo',
  'Équateur', 'Mongala', 'Nord-Ubangi', 'Sud-Ubangi', 'Tshuapa'
];

// Helper to create URL slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/* ==========================================================================
   PUBLIC ENDPOINTS
   ========================================================================== */

// 1. Categories
apiRouter.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC').all();
  res.json(categories);
});

// 2. Provinces list with product counts
apiRouter.get('/provinces', (req, res) => {
  const counts = db.prepare(`
    SELECT province, COUNT(*) as count
    FROM products
    WHERE status = 'published'
    GROUP BY province
  `).all() as { province: string; count: number }[];

  const countMap = new Map(counts.map(c => [c.province, c.count]));
  const result = DRC_PROVINCES.map(name => ({
    name,
    productCount: countMap.get(name) || 0,
  }));
  res.json(result);
});

// 3. Products list with multi-faceted filtering & pagination
apiRouter.get('/products', (req, res) => {
  const {
    category,
    province,
    search,
    availability,
    wholesale,
    featured,
    producerId,
    sort = 'newest',
    page = '1',
    limit = '12',
  } = req.query;

  let query = `
    SELECT p.*,
           c.name as category_name, c.slug as category_slug,
           pr.company_name as producer_name, pr.slug as producer_slug, pr.is_verified as producer_verified,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
           (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND is_moderated = 1) as review_count,
           (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND is_moderated = 1) as average_rating
    FROM products p
    JOIN categories c ON c.id = p.category_id
    JOIN producer_profiles pr ON pr.id = p.producer_id
    WHERE p.status = 'published'
  `;

  const params: unknown[] = [];

  if (category && category !== 'all') {
    query += ` AND (c.slug = ? OR c.id = ?)`;
    params.push(category, category);
  }

  if (province && province !== 'all') {
    query += ` AND p.province = ?`;
    params.push(province);
  }

  if (availability && availability !== 'all') {
    query += ` AND p.availability = ?`;
    params.push(availability);
  }

  if (wholesale === 'true' || wholesale === '1') {
    query += ` AND p.wholesale_available = 1`;
  }

  if (featured === 'true' || featured === '1') {
    query += ` AND p.is_featured = 1`;
  }

  if (producerId) {
    query += ` AND p.producer_id = ?`;
    params.push(producerId);
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    query += ` AND (LOWER(p.name) LIKE ? OR LOWER(p.short_description) LIKE ? OR LOWER(p.full_description) LIKE ? OR LOWER(pr.company_name) LIKE ?)`;
    params.push(q, q, q, q);
  }

  // Count total matching items
  const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
  const countRow = db.prepare(countQuery).get(...params) as { total: number };
  const total = countRow ? countRow.total : 0;

  // Sorting
  if (sort === 'popular') {
    query += ` ORDER BY p.views_count DESC, p.created_at DESC`;
  } else if (sort === 'rating') {
    query += ` ORDER BY average_rating DESC NULLS LAST, p.created_at DESC`;
  } else if (sort === 'price_asc') {
    query += ` ORDER BY p.price_indicative ASC NULLS LAST`;
  } else if (sort === 'price_desc') {
    query += ` ORDER BY p.price_indicative DESC NULLS LAST`;
  } else {
    query += ` ORDER BY p.created_at DESC`;
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 12));
  const offset = (pageNum - 1) * limitNum;

  query += ` LIMIT ? OFFSET ?`;
  params.push(limitNum, offset);

  const products = db.prepare(query).all(...params);

  res.json({
    products,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// 4. Product detail
apiRouter.get('/products/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;

  const product = db.prepare(`
    SELECT p.*,
           c.name as category_name, c.slug as category_slug,
           pr.id as producer_id, pr.company_name as producer_name, pr.slug as producer_slug,
           pr.manager_name, pr.phone as producer_phone, pr.whatsapp as producer_whatsapp,
           pr.email as producer_email, pr.is_verified as producer_verified, pr.logo_url as producer_logo,
           pr.city_territory as producer_city, pr.province as producer_province,
           pr.accepts_wholesale, pr.accepts_distribution
    FROM products p
    JOIN categories c ON c.id = p.category_id
    JOIN producer_profiles pr ON pr.id = p.producer_id
    WHERE (p.id = ? OR p.slug = ?)
  `).get(idOrSlug, idOrSlug) as Record<string, unknown> | undefined;

  if (!product) {
    return res.status(404).json({ error: 'Produit non trouvé.' });
  }

  // Increment views
  db.prepare('UPDATE products SET views_count = views_count + 1 WHERE id = ?').run(product.id as string);

  // Fetch images
  const images = db.prepare(`
    SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC
  `).all(product.id as string);

  // Fetch reviews
  const reviews = db.prepare(`
    SELECT r.*, u.full_name as author_name, u.avatar_url as author_avatar
    FROM product_reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.product_id = ? AND r.is_moderated = 1
    ORDER BY r.created_at DESC
  `).all(product.id as string);

  // Calculate rating stats
  const ratings = reviews as { rating: number }[];
  const avg = ratings.length > 0
    ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10
    : 0;

  // Compute WhatsApp link for quick direct purchase inquiry
  const prodPhone = (product.producer_whatsapp || product.producer_phone) as string;
  const whatsappUrl = formatWhatsAppLink(
    prodPhone,
    `Bonjour, j'ai découvert votre produit "${product.name}" sur Biloko Na Biso et je souhaiterais obtenir des informations.`
  );

  res.json({
    ...product,
    images,
    reviews,
    averageRating: avg,
    reviewCount: ratings.length,
    directWhatsAppUrl: whatsappUrl,
  });
});

// 5. Producers directory
apiRouter.get('/producers', (req, res) => {
  const { province, sector, search, verified, sort = 'name' } = req.query;

  let query = `
    SELECT pr.*,
           (SELECT COUNT(*) FROM products WHERE producer_id = pr.id AND status = 'published') as product_count
    FROM producer_profiles pr
    JOIN users u ON u.id = pr.user_id
    WHERE u.status = 'active'
  `;

  const params: unknown[] = [];

  if (province && province !== 'all') {
    query += ` AND pr.province = ?`;
    params.push(province);
  }

  if (sector && sector !== 'all') {
    query += ` AND pr.sector = ?`;
    params.push(sector);
  }

  if (verified === 'true' || verified === '1') {
    query += ` AND pr.is_verified = 1`;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    query += ` AND (LOWER(pr.company_name) LIKE ? OR LOWER(pr.description) LIKE ? OR LOWER(pr.city_territory) LIKE ?)`;
    params.push(q, q, q);
  }

  if (sort === 'popular') {
    query += ` ORDER BY pr.views_count DESC`;
  } else if (sort === 'products') {
    query += ` ORDER BY product_count DESC`;
  } else {
    query += ` ORDER BY pr.company_name ASC`;
  }

  const producers = db.prepare(query).all(...params);
  res.json(producers);
});

// 6. Producer public profile
apiRouter.get('/producers/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;

  const producer = db.prepare(`
    SELECT pr.*, u.full_name as user_full_name, u.created_at as member_since
    FROM producer_profiles pr
    JOIN users u ON u.id = pr.user_id
    WHERE pr.id = ? OR pr.slug = ?
  `).get(idOrSlug, idOrSlug) as Record<string, unknown> | undefined;

  if (!producer) {
    return res.status(404).json({ error: 'Producteur non trouvé.' });
  }

  // Increment profile views
  db.prepare('UPDATE producer_profiles SET views_count = views_count + 1 WHERE id = ?').run(producer.id as string);

  // Published products
  const products = db.prepare(`
    SELECT p.*,
           c.name as category_name,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
           (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND is_moderated = 1) as review_count,
           (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND is_moderated = 1) as average_rating
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.producer_id = ? AND p.status = 'published'
    ORDER BY p.created_at DESC
  `).all(producer.id as string);

  // Overall rating calculation across products
  const allReviews = db.prepare(`
    SELECT r.rating
    FROM product_reviews r
    JOIN products p ON p.id = r.product_id
    WHERE p.producer_id = ? AND r.is_moderated = 1
  `).all(producer.id as string) as { rating: number }[];

  const avg = allReviews.length > 0
    ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10
    : 0;

  const directWhatsAppUrl = formatWhatsAppLink(
    (producer.whatsapp || producer.phone) as string,
    `Bonjour ${producer.company_name}, j'ai découvert votre entreprise sur Biloko Na Biso.`
  );

  res.json({
    ...producer,
    products,
    productCount: products.length,
    overallRating: avg,
    totalReviews: allReviews.length,
    directWhatsAppUrl,
  });
});

// 7. Editorial articles (Savoir-faire congolais)
apiRouter.get('/articles', (req, res) => {
  const articles = db.prepare(`
    SELECT id, title, slug, excerpt, cover_image, category, author_name, read_time, published_at
    FROM content_articles
    WHERE is_published = 1
    ORDER BY published_at DESC
  `).all();
  res.json(articles);
});

apiRouter.get('/articles/:slug', (req, res) => {
  const article = db.prepare('SELECT * FROM content_articles WHERE slug = ? AND is_published = 1').get(req.params.slug);
  if (!article) {
    return res.status(404).json({ error: 'Article non trouvé.' });
  }
  res.json(article);
});

// 8. Contact & Quote request to a producer
apiRouter.post('/contact-requests', (req, res) => {
  const {
    producerId,
    productId,
    senderName,
    senderEmail,
    senderPhone,
    requestType,
    estimatedQuantity,
    message,
    consent,
  } = req.body;

  if (!producerId || !senderName || !senderEmail || !message) {
    return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires (nom, e-mail, message).' });
  }

  if (!consent) {
    return res.status(400).json({ error: 'Veuillez accepter les règles de confidentialité.' });
  }

  const id = 'req-' + crypto.randomUUID();
  const now = Date.now();

  db.prepare(`
    INSERT INTO contact_requests (
      id, producer_id, product_id, sender_name, sender_email,
      sender_phone, request_type, estimated_quantity, message, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
  `).run(
    id,
    producerId,
    productId || null,
    senderName.trim(),
    senderEmail.trim(),
    senderPhone ? senderPhone.trim() : null,
    requestType || 'achat',
    estimatedQuantity ? estimatedQuantity.trim() : null,
    message.trim(),
    now
  );

  res.json({
    success: true,
    message: 'Votre message a été transmis avec succès au producteur. Une confirmation a été enregistrée.',
    requestId: id,
  });
});

// 8.1 Public Contact Message (General contact to Little Giants team)
apiRouter.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Veuillez renseigner votre nom, votre e-mail, l’objet et votre message.' });
  }

  const id = 'msg-' + crypto.randomUUID();
  const now = Date.now();

  try {
    // 1. Persist in database so message is permanently stored
    db.prepare(`
      INSERT INTO contact_messages (id, name, email, phone, subject, message, status, email_dispatched, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'unread', 0, ?)
    `).run(id, name.trim(), email.trim().toLowerCase(), phone ? phone.trim() : null, subject.trim(), message.trim(), now);

    // 2. Dispatch email via mailer
    const mailResult = await sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : undefined,
      subject: subject.trim(),
      message: message.trim(),
    });

    if (mailResult.dispatched) {
      db.prepare('UPDATE contact_messages SET email_dispatched = 1 WHERE id = ?').run(id);
    }

    // 3. Pre-formatted mailto link for direct client transmission
    const mailtoBody = `Nom : ${name.trim()}
E-mail : ${email.trim()}
Téléphone : ${phone ? phone.trim() : 'Non précisé'}
Date : ${new Date().toLocaleDateString('fr-FR')}

Message :
${message.trim()}

---
Envoyé depuis la plateforme Biloko Na Biso`;

    const mailtoUrl = `mailto:littlegiantrdc@gmail.com?subject=${encodeURIComponent('[Biloko Na Biso] ' + subject.trim())}&body=${encodeURIComponent(mailtoBody)}`;

    // 4. Pre-formatted WhatsApp link
    const whatsappText = `Bonjour Little Giants,\n\nNouveau message depuis Biloko Na Biso :\n*Nom* : ${name.trim()}\n*Email* : ${email.trim()}\n*Objet* : ${subject.trim()}\n\n*Message* :\n${message.trim()}`;
    const whatsappUrl = `https://wa.me/243858960478?text=${encodeURIComponent(whatsappText)}`;

    res.json({
      success: true,
      messageId: id,
      emailDispatched: mailResult.dispatched,
      mailerReason: mailResult.reason,
      mailtoUrl,
      whatsappUrl,
      targetEmail: 'littlegiantrdc@gmail.com',
      message: 'Votre message a été enregistré et transmis avec succès à l’équipe Little Giants.',
    });
  } catch (err: any) {
    console.error('Error handling contact message:', err);
    res.status(500).json({ error: 'Erreur lors du traitement de votre message.' });
  }
});

// 9. Platform Public Settings
apiRouter.get('/settings/public', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM platform_settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  res.json({
    platformName: settings.platform_name || 'Biloko Na Biso',
    slogan: settings.platform_slogan || 'Le savoir-faire congolais, à portée du monde.',
    officialEmail: settings.contact_email || 'littlegiantrdc@gmail.com',
    whatsappNumber: settings.whatsapp_number || '+243858960478',
    ownerEntity: 'Little Giants',
    ownerUrl: 'https://littlegiantrdc.netlify.app/',
    ownerWhatsApp: 'https://wa.me/243858960478',
  });
});

/* ==========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================== */

// Register Member (Visitor)
apiRouter.post('/auth/register', (req, res) => {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Nom, e-mail et mot de passe sont obligatoires.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'Un compte avec cette adresse e-mail existe déjà.' });
  }

  const userId = 'usr-' + crypto.randomUUID();
  const now = Date.now();
  const { hash, salt } = hashPassword(password);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, role, full_name, phone, is_email_verified, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'visitor', ?, ?, 1, 'active', ?, ?)
  `).run(userId, email.toLowerCase().trim(), hash, salt, fullName.trim(), phone ? phone.trim() : null, now, now);

  const { token, expiresAt } = createSession(userId);

  res.json({
    success: true,
    message: 'Compte membre créé avec succès !',
    token,
    expiresAt,
    user: {
      id: userId,
      email: email.toLowerCase().trim(),
      role: 'visitor',
      fullName: fullName.trim(),
      avatarUrl: null,
    },
  });
});

// Register Producer
apiRouter.post('/auth/register-producer', (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    companyName,
    sector,
    province,
    cityTerritory,
    description,
    termsAccepted,
  } = req.body;

  if (!termsAccepted) {
    return res.status(400).json({ error: 'Vous devez accepter les conditions d’utilisation.' });
  }

  if (!fullName || !email || !password || !companyName || !province || !phone) {
    return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires du formulaire producteur.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'Un compte avec cette adresse e-mail existe déjà.' });
  }

  const userId = 'usr-' + crypto.randomUUID();
  const producerId = 'prod-' + crypto.randomUUID();
  const now = Date.now();
  const { hash, salt } = hashPassword(password);

  // Generate unique slug
  let baseSlug = slugify(companyName);
  let slug = baseSlug;
  let counter = 1;
  while (db.prepare('SELECT id FROM producer_profiles WHERE slug = ?').get(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, role, full_name, phone, is_email_verified, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'producer', ?, ?, 1, 'active', ?, ?)
  `).run(userId, email.toLowerCase().trim(), hash, salt, fullName.trim(), phone.trim(), now, now);

  db.prepare(`
    INSERT INTO producer_profiles (
      id, user_id, company_name, slug, manager_name, phone, whatsapp, email, sector,
      province, city_territory, description, accepts_wholesale, accepts_distribution,
      is_verified, verification_status, views_count, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, 1, 1,
      0, 'none', 0, ?, ?
    )
  `).run(
    producerId,
    userId,
    companyName.trim(),
    slug,
    fullName.trim(),
    phone.trim(),
    phone.trim(),
    email.toLowerCase().trim(),
    sector || 'Agriculture et céréales',
    province,
    cityTerritory || province,
    description || `Entreprise ${companyName} basée à ${cityTerritory || province}.`,
    now,
    now
  );

  const { token, expiresAt } = createSession(userId);

  res.json({
    success: true,
    message: 'Votre compte producteur a été créé ! Bienvenue sur Biloko Na Biso.',
    token,
    expiresAt,
    user: {
      id: userId,
      email: email.toLowerCase().trim(),
      role: 'producer',
      fullName: fullName.trim(),
      producerId,
      companyName: companyName.trim(),
      slug,
      isVerified: false,
    },
  });
});

// Login
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Veuillez saisir votre e-mail et votre mot de passe.' });
  }

  const user = db.prepare(`
    SELECT u.*, p.id as producer_id, p.company_name as producer_company, p.slug as producer_slug, p.is_verified as producer_verified
    FROM users u
    LEFT JOIN producer_profiles p ON p.user_id = u.id
    WHERE LOWER(u.email) = ?
  `).get(email.toLowerCase().trim()) as (Record<string, unknown> & { password_hash: string; salt: string; status: string }) | undefined;

  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Ce compte a été suspendu par l’administration.' });
  }

  const valid = verifyPassword(password, user.password_hash, user.salt);
  if (!valid) {
    return res.status(401).json({ error: 'Identifiants invalides.' });
  }

  const { token, expiresAt } = createSession(user.id as string);

  res.json({
    success: true,
    token,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      producerId: user.producer_id,
      producerCompany: user.producer_company,
      producerSlug: user.producer_slug,
      isVerified: Boolean(user.producer_verified),
    },
  });
});

// Current user info
apiRouter.get('/auth/me', (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié.' });
  }
  res.json({ user: req.user });
});

// Logout
apiRouter.post('/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    destroySession(authHeader.substring(7));
  }
  res.json({ success: true, message: 'Déconnexion effectuée.' });
});

// Forgot Password
apiRouter.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Veuillez saisir votre adresse e-mail.' });
  }

  const user = db.prepare('SELECT id, email FROM users WHERE LOWER(email) = ?').get(email.toLowerCase().trim()) as
    | { id: string; email: string }
    | undefined;

  if (user) {
    const token = crypto.randomBytes(24).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour
    db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?').run(token, expires, user.id);

    return res.json({
      success: true,
      message: 'Un lien de réinitialisation sécurisé a été généré.',
      resetToken: token, // For seamless demonstration testing
      resetUrl: `/reinitialiser-mot-de-passe?token=${token}`,
    });
  }

  // To protect privacy, do not reveal if email exists
  res.json({
    success: true,
    message: 'Si un compte correspond à cet e-mail, des instructions y ont été envoyées.',
  });
});

// Reset Password
apiRouter.post('/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Jeton et nouveau mot de passe requis.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' });
  }

  const now = Date.now();
  const user = db.prepare('SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > ?').get(token, now) as
    | { id: string }
    | undefined;

  if (!user) {
    return res.status(400).json({ error: 'Le lien de réinitialisation est invalide ou a expiré.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  db.prepare(`
    UPDATE users SET password_hash = ?, salt = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = ?
    WHERE id = ?
  `).run(hash, salt, now, user.id);

  res.json({ success: true, message: 'Votre mot de passe a été réinitialisé avec succès.' });
});

// Update Member Profile
apiRouter.put('/auth/profile', requireAuth, (req: AuthRequest, res) => {
  const { fullName, phone, avatarUrl } = req.body;
  const user = req.user!;
  const now = Date.now();

  db.prepare(`
    UPDATE users SET full_name = ?, phone = ?, avatar_url = ?, updated_at = ?
    WHERE id = ?
  `).run(fullName || user.full_name, phone || user.phone, avatarUrl || user.avatar_url, now, user.id);

  res.json({ success: true, message: 'Profil mis à jour avec succès.' });
});

// Change Password
apiRouter.put('/auth/change-password', requireAuth, (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user!;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' });
  }

  const row = db.prepare('SELECT password_hash, salt FROM users WHERE id = ?').get(user.id) as {
    password_hash: string;
    salt: string;
  };

  if (!verifyPassword(currentPassword, row.password_hash, row.salt)) {
    return res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?').run(hash, salt, Date.now(), user.id);

  res.json({ success: true, message: 'Mot de passe modifié avec succès.' });
});

/* ==========================================================================
   FAVORITES & REVIEWS (MEMBER ACTIONS)
   ========================================================================== */

// Get user favorites
apiRouter.get('/favorites', requireAuth, (req: AuthRequest, res) => {
  const favorites = db.prepare(`
    SELECT f.id as favorite_id, f.created_at as saved_at,
           p.*, c.name as category_name, pr.company_name as producer_name, pr.is_verified as producer_verified,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
    FROM favorites f
    JOIN products p ON p.id = f.product_id
    JOIN categories c ON c.id = p.category_id
    JOIN producer_profiles pr ON pr.id = p.producer_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `).all(req.user!.id);

  res.json(favorites);
});

// Toggle favorite
apiRouter.post('/favorites/:productId', requireAuth, (req: AuthRequest, res) => {
  const { productId } = req.params;
  const userId = req.user!.id;

  const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?').get(userId, productId);

  if (existing) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?').run(userId, productId);
    return res.json({ favorited: false, message: 'Produit retiré des favoris.' });
  } else {
    const id = 'fav-' + crypto.randomUUID();
    db.prepare('INSERT INTO favorites (id, user_id, product_id, created_at) VALUES (?, ?, ?, ?)').run(
      id,
      userId,
      productId,
      Date.now()
    );
    return res.json({ favorited: true, message: 'Produit ajouté à vos favoris.' });
  }
});

// Add Review (Authenticated, 1 per product per member)
apiRouter.post('/products/:productId/reviews', requireAuth, (req: AuthRequest, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user!.id;

  if (!rating || rating < 1 || rating > 5 || !comment || comment.trim().length < 5) {
    return res.status(400).json({ error: 'Veuillez attribuer une note entre 1 et 5 et un commentaire constructif.' });
  }

  const existing = db.prepare('SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?').get(productId, userId);
  const now = Date.now();

  if (existing) {
    // Update existing review
    db.prepare(`
      UPDATE product_reviews SET rating = ?, comment = ?, updated_at = ?
      WHERE product_id = ? AND user_id = ?
    `).run(rating, comment.trim(), now, productId, userId);

    return res.json({ success: true, message: 'Votre avis a été mis à jour.' });
  }

  const id = 'rev-' + crypto.randomUUID();
  db.prepare(`
    INSERT INTO product_reviews (id, product_id, user_id, rating, comment, is_moderated, is_reported, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)
  `).run(id, productId, userId, rating, comment.trim(), now, now);

  res.json({ success: true, message: 'Merci ! Votre avis a été publié avec succès.' });
});

// Report abusive review
apiRouter.post('/reviews/:id/report', requireAuth, (req: AuthRequest, res) => {
  const { reason } = req.body;
  db.prepare('UPDATE product_reviews SET is_reported = 1, report_reason = ? WHERE id = ?').run(
    reason || 'Contenu signalé par un utilisateur',
    req.params.id
  );
  res.json({ success: true, message: 'Avis signalé à l’équipe de modération.' });
});

/* ==========================================================================
   PRODUCER PRIVATE DASHBOARD & MANAGEMENT
   ========================================================================== */

// Producer Dashboard Summary
apiRouter.get('/producer/dashboard', requireProducer, (req: AuthRequest, res) => {
  const producerId = req.user!.producer_id;
  if (!producerId) {
    return res.status(400).json({ error: 'Profil producteur non trouvé.' });
  }

  const profile = db.prepare('SELECT * FROM producer_profiles WHERE id = ?').get(producerId);

  const productStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
      COALESCE(SUM(views_count), 0) as total_product_views
    FROM products WHERE producer_id = ?
  `).get(producerId) as Record<string, number>;

  const inquiryStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_inquiries
    FROM contact_requests WHERE producer_id = ?
  `).get(producerId) as Record<string, number>;

  const favoritesCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM favorites f
    JOIN products p ON p.id = f.product_id
    WHERE p.producer_id = ?
  `).get(producerId) as { count: number };

  const recentInquiries = db.prepare(`
    SELECT r.*, p.name as product_name
    FROM contact_requests r
    LEFT JOIN products p ON p.id = r.product_id
    WHERE r.producer_id = ?
    ORDER BY r.created_at DESC
    LIMIT 5
  `).all(producerId);

  res.json({
    profile,
    products: productStats,
    inquiries: inquiryStats,
    totalFavorites: favoritesCount ? favoritesCount.count : 0,
    recentInquiries,
  });
});

// Producer Own Products
apiRouter.get('/producer/products', requireProducer, (req: AuthRequest, res) => {
  const producerId = req.user!.producer_id;
  const products = db.prepare(`
    SELECT p.*, c.name as category_name,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
           (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.producer_id = ?
    ORDER BY p.created_at DESC
  `).all(producerId);

  res.json(products);
});

// Producer Add Product
apiRouter.post('/producer/products', requireProducer, (req: AuthRequest, res) => {
  const producerId = req.user!.producer_id;
  const {
    name,
    shortDescription,
    fullDescription,
    categoryId,
    subCategory,
    province,
    cityTerritory,
    productionType,
    rawMaterials,
    manufacturingProcess,
    packagingVariants,
    priceIndicative,
    currency = 'USD',
    availability = 'available',
    wholesaleAvailable = true,
    retailAvailable = true,
    certificationsLabels,
    images = [],
    status = 'published', // or draft
  } = req.body;

  if (!name || !shortDescription || !categoryId || !province) {
    return res.status(400).json({ error: 'Nom, résumé, catégorie et province sont obligatoires.' });
  }

  const productId = 'prod-' + crypto.randomUUID();
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;
  while (db.prepare('SELECT id FROM products WHERE slug = ?').get(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const now = Date.now();

  db.prepare(`
    INSERT INTO products (
      id, producer_id, name, slug, short_description, full_description, category_id,
      sub_category, province, city_territory, production_type, raw_materials,
      manufacturing_process, packaging_variants, price_indicative, currency,
      availability, wholesale_available, retail_available, certifications_labels,
      status, views_count, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, 0, ?, ?
    )
  `).run(
    productId,
    producerId,
    name.trim(),
    slug,
    shortDescription.trim(),
    (fullDescription || shortDescription).trim(),
    categoryId,
    subCategory || null,
    province,
    cityTerritory || province,
    productionType || 'transforme',
    rawMaterials || null,
    manufacturingProcess || null,
    packagingVariants || null,
    priceIndicative ? parseFloat(priceIndicative) : null,
    currency,
    availability,
    wholesaleAvailable ? 1 : 0,
    retailAvailable ? 1 : 0,
    certificationsLabels || null,
    status,
    now,
    now
  );

  // Insert images
  const imgInsert = db.prepare(`
    INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  if (Array.isArray(images) && images.length > 0) {
    images.forEach((imgUrl: string, idx: number) => {
      imgInsert.run('img-' + crypto.randomUUID(), productId, imgUrl, idx === 0 ? 1 : 0, idx);
    });
  } else {
    // Default placeholder Congolese image
    imgInsert.run('img-' + crypto.randomUUID(), productId, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80', 1, 0);
  }

  res.json({
    success: true,
    message: 'Produit créé avec succès !',
    productId,
    slug,
  });
});

// Producer Update Product
apiRouter.put('/producer/products/:id', requireProducer, (req: AuthRequest, res) => {
  const { id } = req.params;
  const producerId = req.user!.producer_id;

  const existing = db.prepare('SELECT id, producer_id FROM products WHERE id = ?').get(id) as
    | { id: string; producer_id: string }
    | undefined;

  if (!existing || (existing.producer_id !== producerId && req.user!.role !== 'admin')) {
    return res.status(403).json({ error: 'Accès refusé pour modifier ce produit.' });
  }

  const {
    name,
    shortDescription,
    fullDescription,
    categoryId,
    subCategory,
    province,
    cityTerritory,
    productionType,
    rawMaterials,
    manufacturingProcess,
    packagingVariants,
    priceIndicative,
    currency,
    availability,
    wholesaleAvailable,
    retailAvailable,
    certificationsLabels,
    images,
    status,
  } = req.body;

  const now = Date.now();

  db.prepare(`
    UPDATE products SET
      name = COALESCE(?, name),
      short_description = COALESCE(?, short_description),
      full_description = COALESCE(?, full_description),
      category_id = COALESCE(?, category_id),
      sub_category = COALESCE(?, sub_category),
      province = COALESCE(?, province),
      city_territory = COALESCE(?, city_territory),
      production_type = COALESCE(?, production_type),
      raw_materials = COALESCE(?, raw_materials),
      manufacturing_process = COALESCE(?, manufacturing_process),
      packaging_variants = COALESCE(?, packaging_variants),
      price_indicative = ?,
      currency = COALESCE(?, currency),
      availability = COALESCE(?, availability),
      wholesale_available = COALESCE(?, wholesale_available),
      retail_available = COALESCE(?, retail_available),
      certifications_labels = COALESCE(?, certifications_labels),
      status = COALESCE(?, status),
      updated_at = ?
    WHERE id = ?
  `).run(
    name,
    shortDescription,
    fullDescription,
    categoryId,
    subCategory,
    province,
    cityTerritory,
    productionType,
    rawMaterials,
    manufacturingProcess,
    packagingVariants,
    priceIndicative !== undefined ? (priceIndicative ? parseFloat(priceIndicative) : null) : null,
    currency,
    availability,
    wholesaleAvailable !== undefined ? (wholesaleAvailable ? 1 : 0) : null,
    retailAvailable !== undefined ? (retailAvailable ? 1 : 0) : null,
    certificationsLabels,
    status,
    now,
    id
  );

  // Update images if provided
  if (Array.isArray(images) && images.length > 0) {
    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
    const imgInsert = db.prepare(`
      INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    images.forEach((imgUrl: string, idx: number) => {
      imgInsert.run('img-' + crypto.randomUUID(), id, imgUrl, idx === 0 ? 1 : 0, idx);
    });
  }

  res.json({ success: true, message: 'Fiche produit mise à jour avec succès.' });
});

// Producer Delete Product
apiRouter.delete('/producer/products/:id', requireProducer, (req: AuthRequest, res) => {
  const { id } = req.params;
  const producerId = req.user!.producer_id;

  const existing = db.prepare('SELECT id, producer_id FROM products WHERE id = ?').get(id) as
    | { id: string; producer_id: string }
    | undefined;

  if (!existing || (existing.producer_id !== producerId && req.user!.role !== 'admin')) {
    return res.status(403).json({ error: 'Accès non autorisé.' });
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ success: true, message: 'Produit supprimé du catalogue.' });
});

// Producer Inquiries Inbox
apiRouter.get('/producer/inquiries', requireProducer, (req: AuthRequest, res) => {
  const producerId = req.user!.producer_id;
  const inquiries = db.prepare(`
    SELECT r.*, p.name as product_name, p.slug as product_slug
    FROM contact_requests r
    LEFT JOIN products p ON p.id = r.product_id
    WHERE r.producer_id = ?
    ORDER BY r.created_at DESC
  `).all(producerId);

  res.json(inquiries);
});

// Update inquiry status
apiRouter.patch('/producer/inquiries/:id', requireProducer, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const producerId = req.user!.producer_id;

  db.prepare('UPDATE contact_requests SET status = ? WHERE id = ? AND producer_id = ?').run(status, id, producerId);
  res.json({ success: true, message: 'Statut de la demande mis à jour.' });
});

// Producer update profile
apiRouter.put('/producer/profile', requireProducer, (req: AuthRequest, res) => {
  const producerId = req.user!.producer_id;
  const {
    companyName,
    managerName,
    phone,
    whatsapp,
    email,
    sector,
    province,
    cityTerritory,
    address,
    description,
    story,
    missionValues,
    productionMethods,
    foundingYear,
    logoUrl,
    bannerUrl,
    websiteUrl,
    facebook,
    instagram,
    linkedin,
    acceptsWholesale,
    acceptsDistribution,
  } = req.body;

  const now = Date.now();

  db.prepare(`
    UPDATE producer_profiles SET
      company_name = COALESCE(?, company_name),
      manager_name = COALESCE(?, manager_name),
      phone = COALESCE(?, phone),
      whatsapp = COALESCE(?, whatsapp),
      email = COALESCE(?, email),
      sector = COALESCE(?, sector),
      province = COALESCE(?, province),
      city_territory = COALESCE(?, city_territory),
      address = COALESCE(?, address),
      description = COALESCE(?, description),
      story = COALESCE(?, story),
      mission_values = COALESCE(?, mission_values),
      production_methods = COALESCE(?, production_methods),
      founding_year = COALESCE(?, founding_year),
      logo_url = COALESCE(?, logo_url),
      banner_url = COALESCE(?, banner_url),
      website_url = COALESCE(?, website_url),
      facebook = COALESCE(?, facebook),
      instagram = COALESCE(?, instagram),
      linkedin = COALESCE(?, linkedin),
      accepts_wholesale = COALESCE(?, accepts_wholesale),
      accepts_distribution = COALESCE(?, accepts_distribution),
      updated_at = ?
    WHERE id = ?
  `).run(
    companyName,
    managerName,
    phone,
    whatsapp,
    email,
    sector,
    province,
    cityTerritory,
    address,
    description,
    story,
    missionValues,
    productionMethods,
    foundingYear ? parseInt(foundingYear, 10) : null,
    logoUrl,
    bannerUrl,
    websiteUrl,
    facebook,
    instagram,
    linkedin,
    acceptsWholesale !== undefined ? (acceptsWholesale ? 1 : 0) : null,
    acceptsDistribution !== undefined ? (acceptsDistribution ? 1 : 0) : null,
    now,
    producerId
  );

  res.json({ success: true, message: 'Profil entreprise mis à jour avec succès.' });
});

// Producer Request Verification
apiRouter.post('/producer/request-verification', requireProducer, (req: AuthRequest, res) => {
  const producerId = req.user!.producer_id;
  const { notes, documentLinks } = req.body;

  const fullNotes = `Demande de vérification soumise le ${new Date().toLocaleDateString('fr-FR')}. Notes: ${notes || 'Aucune'}. Justificatifs: ${documentLinks || 'Transmis par e-mail'}`;

  db.prepare(`
    UPDATE producer_profiles
    SET verification_status = 'pending', verification_notes = ?, updated_at = ?
    WHERE id = ?
  `).run(fullNotes, Date.now(), producerId);

  res.json({
    success: true,
    message: 'Votre dossier de vérification a été transmis à l’administration. Un audit documentaire est en cours.',
  });
});

/* ==========================================================================
   ADMINISTRATION ENDPOINTS (PROTECTED VIA requireAdmin)
   ========================================================================== */

// Admin Metrics
apiRouter.get('/admin/metrics', requireAdmin, (req: AuthRequest, res) => {
  try {
    const members = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'visitor'").get() as { count: number }) || { count: 0 };
    const producers = (db.prepare('SELECT COUNT(*) as count FROM producer_profiles').get() as { count: number }) || { count: 0 };
    const verifiedProducers = (db.prepare('SELECT COUNT(*) as count FROM producer_profiles WHERE is_verified = 1').get() as { count: number }) || { count: 0 };
    const pendingVerifications = (db.prepare("SELECT COUNT(*) as count FROM producer_profiles WHERE verification_status = 'pending'").get() as { count: number }) || { count: 0 };
    const products = (db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'published'").get() as { count: number }) || { count: 0 };
    const pendingProducts = (db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'pending'").get() as { count: number }) || { count: 0 };
    const reports = (db.prepare('SELECT COUNT(*) as count FROM product_reviews WHERE is_reported = 1').get() as { count: number }) || { count: 0 };
    const totalInquiries = (db.prepare('SELECT COUNT(*) as count FROM contact_requests').get() as { count: number }) || { count: 0 };
    const totalContactMessages = (db.prepare('SELECT COUNT(*) as count FROM contact_messages').get() as { count: number }) || { count: 0 };
    const unreadContactMessages = (db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'").get() as { count: number }) || { count: 0 };

    const recentLogs = db.prepare(`
      SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 10
    `).all() || [];

    res.json({
      totalMembers: members.count,
      totalProducers: producers.count,
      verifiedProducers: verifiedProducers.count,
      pendingVerifications: pendingVerifications.count,
      totalPublishedProducts: products.count,
      pendingProducts: pendingProducts.count,
      reportedReviews: reports.count,
      totalInquiries: totalInquiries.count,
      totalContactMessages: totalContactMessages.count,
      unreadContactMessages: unreadContactMessages.count,
      recentLogs,
    });
  } catch (err) {
    console.error('Error fetching admin metrics:', err);
    res.status(500).json({ error: 'Erreur lors du calcul des indicateurs.' });
  }
});

// Admin Producers List & Actions
apiRouter.get('/admin/producers', requireAdmin, (req: AuthRequest, res) => {
  const producers = db.prepare(`
    SELECT pr.*, u.email as user_email, u.status as user_status,
           (SELECT COUNT(*) FROM products WHERE producer_id = pr.id) as product_count
    FROM producer_profiles pr
    JOIN users u ON u.id = pr.user_id
    ORDER BY pr.created_at DESC
  `).all();
  res.json(producers);
});

// Admin verify / reject producer
apiRouter.patch('/admin/producers/:id/verification', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { isVerified, status, notes } = req.body;
  const now = Date.now();

  db.prepare(`
    UPDATE producer_profiles
    SET is_verified = ?, verification_status = ?, verification_notes = ?, updated_at = ?
    WHERE id = ?
  `).run(isVerified ? 1 : 0, status || (isVerified ? 'verified' : 'rejected'), notes || null, now, id);

  logAdminAction(
    req.user!.id,
    req.user!.email,
    isVerified ? 'VERIFY_PRODUCER' : 'REJECT_VERIFICATION',
    'producer_profile',
    id,
    { isVerified, notes }
  );

  res.json({ success: true, message: 'Statut de vérification mis à jour.' });
});

// Admin Suspend Producer / User
apiRouter.patch('/admin/users/:id/status', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?').run(status, Date.now(), id);

  logAdminAction(req.user!.id, req.user!.email, 'UPDATE_USER_STATUS', 'user', id, { status });

  res.json({ success: true, message: `Statut du compte modifié: ${status}.` });
});

// Admin Products List & Moderation
apiRouter.get('/admin/products', requireAdmin, (req: AuthRequest, res) => {
  const products = db.prepare(`
    SELECT p.*, pr.company_name as producer_name, c.name as category_name
    FROM products p
    JOIN producer_profiles pr ON pr.id = p.producer_id
    JOIN categories c ON c.id = p.category_id
    ORDER BY p.created_at DESC
  `).all();
  res.json(products);
});

apiRouter.patch('/admin/products/:id/status', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, isFeatured, rejectionReason } = req.body;
  const now = Date.now();

  db.prepare(`
    UPDATE products
    SET status = COALESCE(?, status),
        is_featured = COALESCE(?, is_featured),
        rejection_reason = ?,
        updated_at = ?
    WHERE id = ?
  `).run(status, isFeatured !== undefined ? (isFeatured ? 1 : 0) : null, rejectionReason || null, now, id);

  logAdminAction(req.user!.id, req.user!.email, 'MODERATE_PRODUCT', 'product', id, { status, isFeatured, rejectionReason });

  res.json({ success: true, message: 'Produit mis à jour avec succès.' });
});

// Admin Users List
apiRouter.get('/admin/users', requireAdmin, (req: AuthRequest, res) => {
  const users = db.prepare(`
    SELECT id, email, role, full_name, phone, status, is_email_verified, created_at
    FROM users
    ORDER BY created_at DESC
  `).all();
  res.json(users);
});

// Admin Reviews Moderation
apiRouter.get('/admin/reviews', requireAdmin, (req: AuthRequest, res) => {
  const reviews = db.prepare(`
    SELECT r.*, p.name as product_name, u.full_name as user_name, u.email as user_email
    FROM product_reviews r
    JOIN products p ON p.id = r.product_id
    JOIN users u ON u.id = r.user_id
    ORDER BY r.is_reported DESC, r.created_at DESC
  `).all();
  res.json(reviews);
});

apiRouter.patch('/admin/reviews/:id/moderate', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { isModerated, clearReport } = req.body;

  db.prepare(`
    UPDATE product_reviews
    SET is_moderated = ?, is_reported = ?, updated_at = ?
    WHERE id = ?
  `).run(isModerated ? 1 : 0, clearReport ? 0 : 1, Date.now(), id);

  logAdminAction(req.user!.id, req.user!.email, 'MODERATE_REVIEW', 'review', id, { isModerated });

  res.json({ success: true, message: 'Modération appliquée.' });
});

apiRouter.delete('/admin/reviews/:id', requireAdmin, (req: AuthRequest, res) => {
  db.prepare('DELETE FROM product_reviews WHERE id = ?').run(req.params.id);
  logAdminAction(req.user!.id, req.user!.email, 'DELETE_REVIEW', 'review', req.params.id);
  res.json({ success: true, message: 'Avis supprimé définitivement.' });
});

// Admin Audit Logs
apiRouter.get('/admin/audit-logs', requireAdmin, (req: AuthRequest, res) => {
  const logs = db.prepare('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 100').all();
  res.json(logs);
});

// Admin Articles Management
apiRouter.post('/admin/articles', requireAdmin, (req: AuthRequest, res) => {
  const { title, excerpt, content, coverImage, category, readTime, isPublished } = req.body;
  if (!title || !excerpt || !content) {
    return res.status(400).json({ error: 'Titre, extrait et contenu sont obligatoires.' });
  }

  const id = 'art-' + crypto.randomUUID();
  let baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;
  while (db.prepare('SELECT id FROM content_articles WHERE slug = ?').get(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const now = Date.now();
  db.prepare(`
    INSERT INTO content_articles (
      id, title, slug, excerpt, content, cover_image, category, author_name,
      read_time, is_published, published_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    title.trim(),
    slug,
    excerpt.trim(),
    content.trim(),
    coverImage || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80',
    category || 'Savoir-Faire',
    req.user!.full_name,
    readTime || '5 min',
    isPublished ? 1 : 0,
    now,
    now
  );

  logAdminAction(req.user!.id, req.user!.email, 'CREATE_ARTICLE', 'article', id, { title });

  res.json({ success: true, message: 'Article publié avec succès !', id, slug });
});

// Admin Settings
apiRouter.get('/admin/settings', requireAdmin, (req: AuthRequest, res) => {
  const settings = db.prepare('SELECT key, value, updated_at FROM platform_settings').all();
  res.json(settings);
});

apiRouter.put('/admin/settings', requireAdmin, (req: AuthRequest, res) => {
  const updates = req.body as Record<string, string>;
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO platform_settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);

  for (const [k, v] of Object.entries(updates)) {
    stmt.run(k, String(v), now);
  }

  logAdminAction(req.user!.id, req.user!.email, 'UPDATE_SETTINGS', 'settings', null, updates);

  res.json({ success: true, message: 'Paramètres mis à jour.' });
});

// Admin Contact Messages List
apiRouter.get('/admin/contact-messages', requireAdmin, (req: AuthRequest, res) => {
  const messages = db.prepare(`
    SELECT * FROM contact_messages ORDER BY created_at DESC
  `).all();
  res.json(messages);
});

// Admin Mark Message Status
apiRouter.patch('/admin/contact-messages/:id', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'read', 'unread', 'archived'
  db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id);
  res.json({ success: true, message: 'Statut du message mis à jour.' });
});

// Admin Delete Contact Message
apiRouter.delete('/admin/contact-messages/:id', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
  res.json({ success: true, message: 'Message supprimé.' });
});

/* ==========================================================================
   IMAGE UPLOAD ENDPOINT (Local file storage in public/uploads/)
   ========================================================================== */
apiRouter.post('/upload', requireAuth, (req: AuthRequest, res) => {
  const { data, filename, contentType } = req.body;

  if (!data || !filename) {
    return res.status(400).json({ error: 'Données d’image manquantes.' });
  }

  // Base64 decode
  try {
    const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Max 10MB limit
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'La taille du fichier ne doit pas dépasser 10 Mo.' });
    }

    const ext = path.extname(filename) || '.jpg';
    const safeName = `biloko-${crypto.randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    res.json({
      success: true,
      url: publicUrl,
      size: buffer.length,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Échec du traitement du fichier.' });
  }
});
