import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db';

export interface UserRecord {
  id: string;
  email: string;
  role: 'visitor' | 'producer' | 'admin';
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  is_email_verified: number;
  status: 'active' | 'suspended';
  producer_id?: string | null;
  producer_company?: string | null;
  producer_verified?: number;
  producer_slug?: string | null;
}

export interface AuthRequest extends Request {
  user?: UserRecord;
}

/**
 * Creates a cryptographically random session token for a given user.
 */
export function createSession(userId: string): { token: string; expiresAt: number } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const now = Date.now();

  // Clean old expired sessions for user
  db.prepare('DELETE FROM sessions WHERE user_id = ? AND expires_at < ?').run(userId, now);

  db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(token, userId, expiresAt, now);

  return { token, expiresAt };
}

/**
 * Destroys a session.
 */
export function destroySession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

/**
 * Retrieves user corresponding to a session token.
 */
export function getUserFromToken(token: string): UserRecord | null {
  if (!token) return null;
  const now = Date.now();
  const session = db.prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?').get(token) as
    | { user_id: string; expires_at: number }
    | undefined;

  if (!session || session.expires_at < now) {
    if (session) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
    return null;
  }

  const user = db.prepare(`
    SELECT u.id, u.email, u.role, u.full_name, u.avatar_url, u.phone, u.is_email_verified, u.status,
           p.id as producer_id, p.company_name as producer_company, p.is_verified as producer_verified, p.slug as producer_slug
    FROM users u
    LEFT JOIN producer_profiles p ON p.user_id = u.id
    WHERE u.id = ?
  `).get(session.user_id) as UserRecord | undefined;

  if (!user || user.status === 'suspended') {
    return null;
  }

  return user;
}

/**
 * Express middleware to populate req.user if a valid token is provided.
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-session-token'];
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof customHeader === 'string') {
    token = customHeader.trim();
  }

  if (token) {
    const user = getUserFromToken(token);
    if (user) {
      req.user = user;
    }
  }

  next();
}

/**
 * Express middleware requiring authenticated user.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise pour cette action.' });
  }
  next();
}

/**
 * Express middleware requiring producer role or admin.
 */
export function requireProducer(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }
  if (req.user.role !== 'producer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux producteurs enregistrés.' });
  }
  next();
}

/**
 * Express middleware strictly requiring admin role.
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé : privilèges administrateur requis.' });
  }
  next();
}

/**
 * Records an entry in admin_audit_logs.
 */
export function logAdminAction(
  userId: string | null,
  userEmail: string | null,
  action: string,
  targetType: string,
  targetId?: string | null,
  details?: Record<string, unknown> | string | null
) {
  try {
    const id = 'log-' + crypto.randomUUID();
    const now = Date.now();
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details || '';
    db.prepare(`
      INSERT INTO admin_audit_logs (id, user_id, user_email, action, target_type, target_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, userEmail, action, targetType, targetId || null, detailsStr, now);
  } catch (err) {
    console.error('Error logging admin action:', err);
  }
}
