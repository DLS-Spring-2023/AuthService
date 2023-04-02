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
	 * @param {string} project_id
	 * @returns {Promise<Buffer | null>}
	 * @memberof ProjectKeystoreRepo
	 * @description Finds a project's private key
	 * @description Returns null if not found
	 */
	public async find(type: 'private' | 'public', project_id: string): Promise<Buffer | null> {
		const keystore = await this.db.projectKeystore.findFirst({
			where: { project_id: project_id }
		});

		if (!keystore) {
			return null;
		}

		return RSA.decrypt(
			Buffer.from(type === 'private' ? keystore.private_key : keystore.public_key, 'hex'),
			Buffer.from(keystore.iv, 'hex')
		);
	}

	/**
	 * regenerate all
	 * @returns {Promise<void>}
	 * @memberof ProjectKeystoreRepo
	 * @description Regenerates all project keys
	 */
	public async regenerateAll(): Promise<void> {
		const projectKeys = await this.db.projectKeystore.findMany();
		for (const key of projectKeys) {
			// replace keys with new keys
			const rsa = new RSA();
			const encryptedPrivateKey = RSA.encrypt(rsa.getPrivateKey());
			const encryptedPublicKey = RSA.encrypt(rsa.getPublicKey());
			const iv = RSA.getIv();

			await this.db.projectKeystore.update({
				where: {
					project_id: key.project_id
				},
				data: {
					iv: iv,
					private_key: encryptedPrivateKey.toString('hex'),
					public_key: encryptedPublicKey.toString('hex')
				}
			});
		}
	}
}

export default ProjectKeystoreRepo;
