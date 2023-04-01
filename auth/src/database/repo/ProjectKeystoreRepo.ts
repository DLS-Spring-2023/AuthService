import { PrismaClient } from '@prisma/client';
import { KeystoreRepo } from '../../util/interfaces.js';
import RSA from '../../security/keygen/RSA.js';

class ProjectKeystoreRepo implements KeystoreRepo {
	private readonly db;

	constructor(db: PrismaClient) {
		this.db = db;
	}

	/**
	 * findById
	 */
	public async find(type: 'private' | 'public', project_id: string): Promise<Buffer | null> {
		const keystore = await this.db.projectKeystore.findFirst({
			where: { project_id: project_id }
		});

		if (!keystore) {
			return null;
		}

		console.log(`${new Date()}: [ProjectKeystoreRepo] ${type} key found for project ${project_id}`);

		return RSA.decrypt(
			Buffer.from(type === 'private' ? keystore.private_key : keystore.public_key, 'hex'),
			Buffer.from(keystore.iv, 'hex')
		);
	}
}

export default ProjectKeystoreRepo;
