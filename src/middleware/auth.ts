import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase';

export interface AuthRequest extends Request {
    uid?: string;
    userEmail?: string;
}

export async function requireAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token de autenticacao ausente' });
        return;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.uid = decoded.uid;
        req.userEmail = decoded.email;
        next();
    } catch {
        res.status(401).json({ error: 'Token invalido ou expirado' });
    }
}
