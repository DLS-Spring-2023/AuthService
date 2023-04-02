import { AccountSession, AccountTokenData, PrismaClient, UserSession, UserTokenData } from '@prisma/client';
import { SessionType } from '../../util/enums.js';

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
	public async startNewSession({ id, user_id, token_id }: { id: bigint, user_id: string, token_id: bigint }): Promise<AccountSession & AccountTokenData | UserSession & UserTokenData> {

		return await this.table.create({
			data: {
				id: id,
				user_id: user_id,
				tokenData: {
					create: {
						id: token_id,
						valid: true,
						expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 - 1000 * 60) // one year minus a minute
					}
				}
			},
		});
	}

	/**
	 * renewSession
	 */
	public async renewSession(session_id: bigint, token_id: bigint): Promise<any> {
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
		if (!session) {
			this.killSession(session.id);
			return false;
		}

		// invalidate earlier iterations
		const tokenTable: any = this.type === SessionType.ACCOUNT ? this.db.accountTokenData : this.db.userTokenData;
		await tokenTable.updateMany({
			where: {
				session_id: session.id,
				valid: true,
			},
			data: {
				valid: false
			}
		});

		return await this.db.accountTokenData.create({
			data: {
				id: token_id,
				session_id: session.id,
				iteration: session.tokenData[0].iteration + 1,
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 - 1000 * 60) // one year minus a minute
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
