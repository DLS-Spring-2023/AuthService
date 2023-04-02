import { Account, AccountKeystore, PrismaClient } from '@prisma/client';
import { SessionType } from '../util/enums.js';
import AccountRepo from './repo/AccountRepo.js';
import AccountKeystoreRepo from './repo/AccountKeystoreRepo.js';
import SessionRepo from './repo/SessionRepo.js';
import UserRepo from './repo/UserRepo.js';
import ProjectRepo from './repo/ProjectRepo.js';
import ProjectKeystoreRepo from './repo/ProjectKeystoreRepo.js';
import RSA from '../security/keygen/RSA.js';

class DatabaseGateway {
	private readonly db = new PrismaClient();

	public readonly account = new AccountRepo(this.db);
	public readonly accountSession = new SessionRepo(this.db, SessionType.ACCOUNT);
	public readonly accountKeystore = new AccountKeystoreRepo(this.db);
	public readonly user = new UserRepo(this.db);
	public readonly userSession = new SessionRepo(this.db, SessionType.USER);
	public readonly project = new ProjectRepo(this.db);
	public readonly projectKeystore = new ProjectKeystoreRepo(this.db);

	// Initialize Database
	async init() {
		// Check if account keystore exists
		if ((await this.accountKeystore.count()) === 0) {
			console.log('Account keystore not found, generating new...');
			await this.accountKeystore.generateNew();
		}

		// Check if keys can be decrypted with current secret. If not, regenerate keys
		const keys = (await this.db.accountKeystore.findFirst()) as AccountKeystore;
		const decrypted = RSA.decrypt(
			Buffer.from(keys.private_key, 'hex'),
			Buffer.from(keys.iv, 'hex')
		);
		if (!decrypted) {
			console.log('Decryption secret changed, regenerating keys');
			console.log('Regenerating account key...');
			await this.accountKeystore.generateNew();

			console.log('Regenerating project keys...');
			await this.projectKeystore.regenerateAll();
		}

		// Check if account exists and create default account from .env if set
		if (
			(await this.account.count()) === 0 &&
			process.env.ACCOUNT_NAME &&
			process.env.ACCOUNT_PASS &&
			process.env.ACCOUNT_EMAIL
		) {
			console.log('Account not found, creating new...');
			const account = (await this.account.create({
				name: process.env.ACCOUNT_NAME,
				password_hash: process.env.ACCOUNT_PASS,
				email: process.env.ACCOUNT_EMAIL
			} as Account)) as Account;

			// Check if project exists and create default project from .env if set
			if ((await this.db.project.count()) === 0 && process.env.PROJECT_NAMES) {
				const projectNames = process.env.PROJECT_NAMES.split(',');
				for (const projectName of projectNames) {
					console.log(`Creating project ${projectName}...`);
					await this.project.create(projectName, account.id);
				}
			}
		}
	}
}

export default new DatabaseGateway();
