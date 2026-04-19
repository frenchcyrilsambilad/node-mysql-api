import { expressjwt as jwt } from 'express-jwt';
import config from '../config.json';
import db from '../_helpers/db';

const { secret } = config;

export default function authorize(roles: any = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach decoded token to req.auth
        jwt({ secret, algorithms: ['HS256'] }),

        // authorize based on user role
        async (req: any, res: any, next: any) => {
            const account = await db.Account.findByPk(req.auth.id); // ✅ req.auth, not req.user

            if (!account || (roles.length && !roles.includes(account.role))) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // authentication and authorization successful
            req.auth.role = account.role; // ✅ req.auth
            const refreshTokens = await account.getRefreshTokens();
            req.auth.ownsToken = (token: any) => !!refreshTokens.find((x: any) => x.token === token); // ✅ req.auth
            next();
        }
    ];
}