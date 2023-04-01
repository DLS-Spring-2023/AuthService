import jwt, { type JwtPayload, type VerifyOptions, type Algorithm } from 'jsonwebtoken';
import Settings from '../settings/Settings';

const accessTokenVerifyOptions: VerifyOptions = {
	issuer: 'jAuth',
	maxAge: '15m',
	algorithms: ['RS256' as Algorithm]
};

export const verifyAccessToken = async (token: string) => {
	return new Promise<JwtPayload | null>((accept) => {
		jwt.verify(token, Settings.ACCESS_KEY, accessTokenVerifyOptions, async (error, decoded) => {
			if (error) accept(null);
			else accept(decoded as JwtPayload);
		});
	});
};
