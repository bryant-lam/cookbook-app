import jwt from 'jsonwebtoken';
import Principal from '../models/Principal.js';

export const authMiddleware = (query) => async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    // if not a user, treat them as a guest
    if (!token) {
        req.principal = new Principal();
        return next();
    }

    try {
        const claims = jwt.verify(token, process.env.JWT_SECRET);
        req.user = claims;

        const result = await query(
            `SELECT * FROM Users WHERE id = $1`, 
            [claims.sub]
        );
        const userFromDb = result.rows[0];
        req.principal = new Principal({
            ...claims,
            roles: userFromDb.roles,
        });
        next();
    }
    catch (error) {
        console.log('Invalid token', error);
        res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
}

export function authorize(role, allowGuest = false) {
    return (req, res, next) => {
        if (allowGuest && req.principal.isInRole('guest')) {
            return next();
        }
        if (req.principal.isInRole(role)) {
            return next();
        }
        res.status(403).send('Forbidden');
    };
}