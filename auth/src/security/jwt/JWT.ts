import { Account, User } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import SessionRepo from '../../database/repo/SessionRepo.js';
import AccountRepo from '../../database/repo/AccountRepo.js';
import { KeystoreRepo } from '../../util/interfaces.js';
import UserRepo from '../../database/repo/UserRepo.js';
import db from '../../database/DatabaseGateway.js';
import { SessionType } from '../../util/enums.js';
import JwtUtils from './JwUtils.js';
import Log from '../../util/ServiceBus.js';

interface IJWT {
	signAccessToken(account_id: string, session_id: bigint): Promise<string | null>;
	signNewSessionToken(account_id: string): Promise<{ token: string; session_id: bigint } | null>;
	verifyAccessToken(token: string): Promise<{ session_id: bigint; account: Account | User } | null>;
}

class JWT extends JwtUtils implements IJWT {
	private readonly sessionRepo: SessionRepo;
	private readonly accountRepo: AccountRepo | UserRepo;
	private readonly keystore: KeystoreRepo;

	constructor(type: SessionType) {
		super();

		if (type === SessionType.ACCOUNT) {
			this.sessionRepo = db.accountSession;
			this.accountRepo = db.account;
			this.keystore = db.accountKeystore;
		} else {
			this.sessionRepo = db.userSession;
			this.accountRepo = db.user;
			this.keystore = db.projectKeystore;
		}
	}

	public async signAccessToken(user_id: string, session_id: bigint, project_id?: string) {
		const privateKey = await this.keystore.find('private', project_id);
		if (!privateKey) return null;

		const payload = { session_id: String(session_id), project_id };
		const options = { ...JWT.accessTokenSignOptions, subject: user_id };

		return new Promise<string | null>((accept) => {
			jwt.sign(payload, privateKey, options, async (error, encoded) => {
				if (error) accept(null);
				else accept(encoded as string);
			});
		});
	}

	public async signNewSessionToken(user_id: string, projct_id?: string) {
		const privateKey = await this.keystore.find('private', projct_id);
		if (!privateKey) return null;

		const session = await this.sessionRepo.startNewSession(user_id);
		if (!session) return null;

		const payload = {
			token_id: String(session.tokenData[0].id),
			session_id: String(session.id),
			project_id: projct_id
		};
		const options = { ...JWT.sessionTokenSignOptions, subject: user_id };

		return new Promise<{ token: string; session_id: bigint } | null>((accept) => {
			jwt.sign(payload, privateKey, options, (error, encoded) => {
				accept(error || !encoded ? null : { token: encoded, session_id: session.id });
			});
		});
	}

	private async renewSessionToken(user_id: string, session_id: bigint, project_id?: string) {
		const privateKey = await this.keystore.find('private', project_id);
		if (!privateKey) return null;

		const session = await this.sessionRepo.renewSession(session_id);
		if (!session) return null;

		const payload = {
			token_id: String(session.tokenData[0].id),
			session_id: String(session_id),
			project_id
		};
		const options = { ...JWT.sessionTokenSignOptions, subject: user_id };

		return new Promise<string | null>((accept) => {
			jwt.sign(payload, privateKey, options, (error, encoded) => {
				accept(error || !encoded ? null : encoded);
			});
		});
	}

	public async verifyAccessToken(token: string) {
		const publicKey = await this.keystore.find('public', JwtUtils.decodeToken(token)?.project_id);
		if (!publicKey) return null;

		const decoded = await new Promise<JwtPayload | null>((accept) => {
			jwt.verify(token, publicKey, JWT.accessTokenVerifyOptions, (error, decoded) => {
				accept(error || !decoded ? null : (decoded as JwtPayload));
			});
		});

		if (!decoded) return null;

		const { session_id, sub } = decoded as JwtPayload;

		if (!session_id || !sub) {
			return null;
		}

		const account = await this.accountRepo.findById(sub);
		if (!account || !account.enabled) {
			return null;
		}

		const accountSession = await this.sessionRepo.findValidBySessionId(BigInt(session_id));
		if (!accountSession) {
			return null;
		}

		return { session_id, account };
	}

	private async verifySessionToken(token: string) {
		const publicKey = await this.keystore.find('public', JwtUtils.decodeToken(token)?.project_id);
		if (!publicKey) return null;

		const decoded = await new Promise<JwtPayload | null>((accept) => {
			jwt.verify(token, publicKey, JWT.sessionTokenVerifyOptions, async (error, decoded) => {
				error && console.error('RefreshToken:', 'VerifyError -', error.message);
				if (error) Log.logWarning(`Error verifying session token`, {
					error: error.message,
					datetime: new Date().toISOString(),
				});
				
				accept(error || !decoded ? null : (decoded as JwtPayload));
			});
		});

		if (!decoded) return null;

		const { sub, token_id, session_id, project_id } = decoded as JwtPayload;

		if (!sub || !token_id || !session_id) {
			return null;
		}

		// If account/user doesn't exist or is banned, delete all related session tokens
		const account = await this.accountRepo.findById(sub);

		if (!account || !account.enabled) {
			await this.sessionRepo.deleteByUserId(sub);
			return null;
		}

		const session = await this.sessionRepo.findById(BigInt(session_id), BigInt(token_id));
		const tokenData = session?.tokenData[0];

		if (!session || !tokenData) {
			return null;
		}

		// If token is expired or invalid, kill session
		const expired = new Date(Number.parseInt(tokenData.expires.toString())).getTime() < Date.now();
		if (expired || !tokenData.valid) {
			Log.logInfo(`Invalid or expired session token detected`, {
				expired: expired,
				valid: tokenData.valid,
				token: token_id,
				session: session_id,
				datetime: new Date().toISOString(),
			});
			this.sessionRepo.killSession(BigInt(session_id));
			return null;
		}

		return { session_id: BigInt(session_id), account, project_id };
	}

	/**
	 * Verifies, invalidates and renews session
	 */
	public async validateAndRenewSession(token: string): Promise<{
		token: string;
		account: Account | User;
		session_id: bigint;
		project_id?: string;
	} | null> {
		const verified = await this.verifySessionToken(token);
		if (!verified || !verified.account.id) return null;

		const newToken = await this.renewSessionToken(
			verified.account.id,
			verified.session_id,
			verified.project_id
		);

		if (!newToken) return null;

		return {
			token: newToken,
			session_id: verified.session_id,
			account: verified.account,
			project_id: verified.project_id
		};
	}
}

export const AccountJWT = new JWT(SessionType.ACCOUNT);
export const UserJWT = new JWT(SessionType.USER);
