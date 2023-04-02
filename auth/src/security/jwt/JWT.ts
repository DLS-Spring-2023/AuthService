import { Account, AccountSession, User, UserSession } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import SessionRepo from '../../database/repo/SessionRepo.js';
import AccountRepo from '../../database/repo/AccountRepo.js';
import { KeystoreRepo } from '../../util/interfaces.js';
import UserRepo from '../../database/repo/UserRepo.js';
import db from '../../database/DatabaseGateway.js';
import { SessionType } from '../../util/enums.js';
import Snowflake from '../../util/Snowflake.js';
import JwtUtils from './JwUtils.js';
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
		
		const token_id = Snowflake.nextId();
		const session_id = Snowflake.nextId();

		const payload = { token_id: String(token_id), session_id: String(session_id), project_id: projct_id };
		const options = { ...JWT.sessionTokenSignOptions, subject: user_id };

		return new Promise<{ token: string; session_id: bigint } | null>((accept) => {
			jwt.sign(payload, privateKey, options, async (error, encoded) => {
				if (error || !encoded) accept(null);
				else {
					const success = await this.sessionRepo.startNewSession({
						id: session_id,
						user_id,
						token_id,
					});
					accept(success ? { token: encoded, session_id: session_id } : null);
				}
			});
		});
	}

	private async renewSessionToken(user_id: string, session_id: bigint, project_id?: string) {
		const privateKey = await this.keystore.find('private', project_id);
		if (!privateKey) return null;
		
		const token_id = Snowflake.nextId();

		const payload = { token_id: String(token_id), session_id: String(session_id), project_id };
		const options = { ...JWT.sessionTokenSignOptions, subject: user_id };

		return new Promise<string | null>((accept) => {
			jwt.sign(payload, privateKey, options, async (error, encoded) => {
				if (error || !encoded) accept(null);
				else {
					await this.sessionRepo.renewSession(session_id, token_id);
					accept(encoded);
				}
			});
		});
	}

	public async verifyAccessToken(token: string) {
		const publicKey = await this.keystore.find('public', JwtUtils.decodeToken(token).project_id);
		if (!publicKey) return null;

		return new Promise<{ session_id: bigint; account: Account | User } | null>((accept) => {
			jwt.verify(token, publicKey, JWT.accessTokenVerifyOptions, async (error, decoded) => {
				if (error) {
					accept(null);
					return;
				}

				const { session_id, sub } = decoded as JwtPayload;

				if (!session_id || !sub) {
					accept(null);
					return;
				}

				const account = await this.accountRepo.findById(sub);
				if (!account || !account.enabled) {
					accept(null);
					return;
				}

				const accountSession = await this.sessionRepo.findValidBySessionId(BigInt(session_id));
				if (!accountSession) {
					accept(null);
					return;
				}

				accept({ session_id, account });
			});
		});
	}

	private async verifySessionToken(token: string) {
		const publicKey = await this.keystore.find('public', JwtUtils.decodeToken(token).project_id);
		if (!publicKey) return null;

		return new Promise<{ session_id: bigint; account: Account | User; project_id?: string } | null>(
			(accept) => {
				jwt.verify(token, publicKey, JWT.sessionTokenVerifyOptions, async (error, decoded) => {
					if (error) {
						console.error('RefreshToken:', 'VerifyError -', error);
						accept(null);
						return;
					}

					const { sub, token_id, session_id, project_id } = decoded as JwtPayload;
					
					if (!sub || !token_id || !session_id) {
						accept(null);
						return;
					}

					// If account/user doesn't exist or is banned, delete all related session tokens
					const account = await this.accountRepo.findById(sub);
					
					if (!account || !account.enabled) {
						await this.sessionRepo.deleteByUserId(sub);
						accept(null);
						return;
					}

					const session = await this.sessionRepo.findById(BigInt(session_id), BigInt(token_id));
					const tokenData = session?.tokenData[0];
					
					if (!session || !tokenData) {
						accept(null);
						return;
					}

					// If token is expired or invalid, kill session
					const expired =
						new Date(Number.parseInt(tokenData.expires.toString())).getTime() < Date.now();
					if (expired || !tokenData.valid) {
						this.sessionRepo.killSession(BigInt(session_id));
						accept(null);
						return;
					}

					accept({ session_id: BigInt(session_id), account, project_id });
				});
			}
		);
	}

	/**
	 * Verifies, invalidates and renews session
	 */
	public async validateAndRenewSession(token: string): Promise<{
		token: string;
		account: Account | User;
		session_id: bigint;
		projct_id?: string;
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
			projct_id: verified.project_id
		};
	}
}

export const AccountJWT = new JWT(SessionType.ACCOUNT);
export const UserJWT = new JWT(SessionType.USER);
