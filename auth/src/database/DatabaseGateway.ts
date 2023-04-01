import { PrismaClient } from '@prisma/client';
import { SessionTable } from '../util/enums.js';
import AccountRepo from './repo/AccountRepo.js';
import AccountKeystoreRepo from './repo/AccountKeystoreRepo.js';
import SessionRepo from './repo/SessionRepo.js';
import UserRepo from './repo/UserRepo.js';
import ProjectRepo from './repo/ProjectRepo.js';
import ProjectKeystoreRepo from './repo/ProjectKeystoreRepo.js';

class DatabaseGateway {
	private readonly db = new PrismaClient();

	public readonly account = new AccountRepo(this.db);
	public readonly accountSession = new SessionRepo(this.db, SessionTable.ACCOUNT);
	public readonly accountKeystore = new AccountKeystoreRepo(this.db);
	public readonly user = new UserRepo(this.db);
	public readonly userSession = new SessionRepo(this.db, SessionTable.USER);
	public readonly project = new ProjectRepo(this.db);
	public readonly projectKeystore = new ProjectKeystoreRepo(this.db);

	// Initialize Database
	// Does not catch errors as we want the server to crash in case initialization failed!
	async init() {
		if ((await this.accountKeystore.count()) === 0) {
			await this.accountKeystore.generateNew();
		}
	}
}

export default new DatabaseGateway();
