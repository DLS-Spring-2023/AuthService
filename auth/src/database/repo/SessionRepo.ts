import { AccountSession, AccountTokenData, PrismaClient, UserSession, UserTokenData } from '@prisma/client';
import { SessionType } from '../../util/enums.js';
import Snowflake from '../../util/Snowflake.js';

class SessionRepo {
	private readonly db: PrismaClient;
	private readonly table: any;
	private readonly type: SessionType;

	constructor(db: PrismaClient, type: SessionType) {
		this.db = db;
		this.table = type === SessionType.ACCOUNT ? db.accountSession : db.userSession;
		this.type = type;
	}

	/**
	 * findById
	 * @param id
	 * @param token_id
	 */
	public async findById(id: bigint, token_id: bigint): Promise<AccountSession & { tokenData: AccountTokenData[] } | UserSession & { tokenData: UserTokenData[] } | null> {
		return await this.table.findUnique({
			where: {
				id: id
			},
			include: {
				tokenData: { where: { id: token_id, valid: true } },
			}
		});
	}

	/**
	 * findValidBySessionId
	 */
	public async findValidBySessionId(
		session_id: bigint
	): Promise<AccountSession | UserSession | null> {
		return await this.table.findFirst({
			where: {
				id: session_id,
			},
			include: {
				tokenData: { where: { valid: true } }
			}
		});
	}

	/**
	 * save
	 */
	public async startNewSession(user_id: string): Promise<AccountSession & {tokenData: AccountTokenData[]} | UserSession & {tokenData: UserTokenData[]} | null> {
		const id = Snowflake.nextId();
		const token_id = Snowflake.nextId();
		return await this.table.create({
			data: {
				id: id,
				user_id: user_id,
				tokenData: {
					create: {
						id: token_id,
						valid: true,
						expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) // one year
					}
				}
			},
			include: {
				tokenData: { where: { id: token_id } }
			}
		}).catch(() => null);
	}

	/**
	 * renewSession
	 */
	public async renewSession(session_id: bigint): Promise<AccountSession & {tokenData: AccountTokenData[]} | UserTokenData & {tokenData: UserTokenData[]} | null> {
		// find last valid session iteration
		const session = await this.table.findFirst({
			where: {
				id: session_id,
			},
			include: {
				tokenData: { where: { valid: true } }
			}
		});

		// kill session if no valid iteration is found and return
		if (!session || !session.tokenData.length) {
			this.killSession(session.id);
			return null;
		}

		// invalidate earlier iterations
		await this.table.update({
			where: {
				id: session.id
			},
			data: { tokenData: { updateMany: {
				where: {
					valid: true
				},
				data: {
					valid: false
				}
			}}}
		});

		// create new iteration
		const token_id = Snowflake.nextId();
		return await this.table.update({
			where: {
				id: session.id
			},
			data: {
				tokenData: {
					create: {
						id: token_id,
						iteration: session.tokenData[0].iteration + 1,
						expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) // one year
					}
				}
			},
			include: {
				tokenData: { where: { id: token_id } }
			}
		});
	}

	/**
	 * killSession
	 */
	public async killSession(id: bigint) {
		return await this.table.delete({
			where: { id }
		});
	}

	/**
	 * deleteByUserId
	 */
	public async deleteByUserId(user_id: string) {
		return await this.table.deleteMany({
			where: { user_id }
		});
	}
}

export default SessionRepo;
