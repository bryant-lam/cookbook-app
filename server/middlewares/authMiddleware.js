import jwt from 'jsonwebtoken';
import Principal from '../models/Principal.js';

export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' })
    }

    try {
        const claims = jwt.verify(token, process.env.JWT_SECRET);
        req.user = claims;
        req.principal = new Principal(claims);
        next();
    }
    catch (error) {
        console.log('Invalid token', error);
        res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
}

export function authorize(permission, allowGuest = false) {
    return (req, res, next) => {
        if (allowGuest && req.principal.isInRole('guest')) {
            return next();
        }
        if (req.principal?.hasPermission(permission)) {
            return next();
        }
        res.status(403).send('Forbidden');
    };
}