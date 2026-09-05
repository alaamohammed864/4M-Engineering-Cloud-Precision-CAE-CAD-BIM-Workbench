// Real authentication (Priority 5): bcrypt password hashing + JWT.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import * as db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // Fail loudly at startup rather than silently signing tokens with a
  // predictable default secret - a hardcoded fallback secret would make
  // every deployment's tokens forgeable by anyone who read the source.
  throw new Error(
    'JWT_SECRET environment variable is required and was not set. ' +
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
  );
}

const JWT_EXPIRES_IN = '8h';

export interface AuthedRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user: { id: number; email: string; role: string }): string {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Missing or malformed Authorization header (expected: Bearer <token>)' });
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as unknown as { sub: number; email: string; role: string };
    const user = db.findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Token refers to a user that no longer exists' });
    }
    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'UNAUTHENTICATED', message: `Invalid or expired token: ${err.message}` });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Role '${req.user.role}' is not permitted to perform this action (requires one of: ${roles.join(', ')})`,
      });
    }
    next();
  };
}
