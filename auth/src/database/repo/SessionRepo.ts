import { AccountSession, PrismaClient, UserSession } from '@prisma/client';
import { SessionTable } from '../../util/enums.js';

class SessionRepo {
	private readonly db: any;
	private readonly table: SessionTable;

	constructor(db: PrismaClient, table: SessionTable) {
		this.table = table;
		this.db = table === SessionTable.ACCOUNT ? db.accountSession : db.userSession;
	}

	/**
	 * findById
	 */
	public async findById(id: bigint): Promise<AccountSession | UserSession> {
		return await this.db.findUnique({
			where: {
				id: id
			}
		});
	}

	/**
	 * findValidBySessionId
	 */
	public async findValidBySessionId(
		session_id: bigint
	): Promise<AccountSession | UserSession | undefined> {
		return await this.db.findFirst({
			where: {
				session_id: session_id,
				valid: true
			}
		});
	}

	/**
	 * save
	 */
	public async startNewSession(session: AccountSession | UserSession): Promise<boolean> {
		return await this.db.create({
			data: {
				id: session.id,
				session_id: session.session_id,
				user_id: session.user_id,
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 - 1000 * 60) // one year minus a minute
			}
		});
	}

	/**
	 * renewSession
	 */
	public async renewSession(session: AccountSession | UserSession): Promise<boolean> {
		// find last valid session iteration
		const lastIteration = await this.db.findFirst({
			where: {
				session_id: session.session_id,
				valid: true
			},
			orderBy: {
				iteration: 'desc'
			}
		});

		// kill session if no valid iteration is found and return
		if (!lastIteration) {
			this.killSession(session.session_id as bigint);
			return false;
		}

		// invalidate earlier iterations
		await this.db.updateMany({
			where: {
				session_id: session.session_id,
				valid: true
			},
			data: {
				valid: false
			}
		});

		return await this.db.create({
			data: {
				id: session.id,
				session_id: session.session_id,
				user_id: session.user_id,
				iteration: lastIteration.iteration + 1,
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 - 1000 * 60) // one year minus a minute
			}
		});
	}

	/**
	 * killSession
	 */
	public async killSession(session_id: bigint) {
		return await this.db.deleteMany({
			where: { session_id: session_id }
		});
	}

	/**
	 * deleteByUserId
	 */
	public async deleteByUserId(id: string) {
		return await this.db.deleteMany({
			where: { user_id: id }
		});
	}
}

export default SessionRepo;
