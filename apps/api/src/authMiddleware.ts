import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: { // This will be populated with token payload
    userId: number;
    email: string;
    role: string; // Consider using the Role enum from Prisma if exported or define one here
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // Unauthorized if no token
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.sendStatus(403); // Forbidden if token is invalid
    }
    req.user = user as { userId: number; email: string; role: string };
    next();
  });
};

export const authorizeRole = (allowedRoles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.sendStatus(403); // Forbidden if user or role not set
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
      return res.sendStatus(403); // Forbidden if user role not allowed
    }
    next();
  };
}; 