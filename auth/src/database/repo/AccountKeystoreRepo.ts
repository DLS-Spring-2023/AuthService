import { PrismaClient } from '@prisma/client';
import RSA from '../../security/keygen/RSA.js';
import { KeystoreRepo } from '../../util/interfaces.js';
class AccontKeystoreRepo implements KeystoreRepo {
	private db: PrismaClient;

	constructor(db: PrismaClient) {
		this.db = db;
	}

	public async count() {
		return await this.db.accountKeystore.count();
	}

	public async find(type: 'private' | 'public'): Promise<Buffer | null> {
		const keystore = await this.db.accountKeystore.findFirst({
			where: { id: 0 }
		});

		if (!keystore) {
			return null;
		}

		return RSA.decrypt(
			Buffer.from(type === 'private' ? keystore.private_key : keystore.public_key, 'hex'),
			Buffer.from(keystore.iv, 'hex')
		);
	}

	public async generateNew(): Promise<void> {
		const rsa = new RSA();
		const encryptedPrivateKey = RSA.encrypt(rsa.getPrivateKey());
		const encryptedPublicKey = RSA.encrypt(rsa.getPublicKey());
		const iv = RSA.getIv();

		await this.db.accountKeystore.upsert({
			where: {
				id: 0
			},
			update: {
				id: 0,
				iv: iv,
				private_key: encryptedPrivateKey.toString('hex'),
				public_key: encryptedPublicKey.toString('hex')
			},
			create: {
				id: 0,
				iv: iv,
				private_key: encryptedPrivateKey.toString('hex'),
				public_key: encryptedPublicKey.toString('hex')
			}
		});
	}
}

export default AccontKeystoreRepo;
