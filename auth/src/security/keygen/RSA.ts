import NodeRSA from 'node-rsa';
import crypto from 'crypto';
import Logger from '../../util/Logger.js';

enum Format {
	privateDer = 'pkcs8-private-der',
	privatePem = 'pkcs8-private-pem',
	publicDer = 'pkcs8-public-der',
	publicPem = 'pkcs8-public-pem'
}

class RSA {
	private readonly key = new NodeRSA();

	private static algorithm = 'aes-256-cbc';
	private static encryptionKey = crypto.scryptSync(
		process.env.RSA_ENCRYPTION_SECRET || '',
		'salt',
		32
	);
	private static iv = crypto.randomBytes(16);

	constructor() {
		if (!process.env.RSA_ENCRYPTION_SECRET) {
			throw new Error('RSA_ENCRYPTION_SECRET not set');
		}
		this.generate();
	}

	static encrypt(data: string) {
		const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, this.iv);
		return Buffer.concat([cipher.update(data), cipher.final()]);
	}

	static decrypt(data: Buffer, iv: Buffer) {
		const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
		try {
			return Buffer.concat([decipher.update(data), decipher.final()]);
		} catch (e: unknown) {
			return null;
		}
	}

	static getIv() {
		return this.iv.toString('hex');
	}

	// NEVER EXPOSE
	getPrivateKey() {
		return this.key.exportKey(Format.privatePem);
	}

	getPublicKey() {
		return this.key.exportKey(Format.publicPem);
	}

	private generate() {
		if (!this.key.isEmpty()) return;
		const start = performance.now();
		this.key.generateKeyPair();
		const duration = (performance.now() - start) / 1000;
		Logger.logInfo(`Generated new RSA key`, {
			duration: `${duration}s`,
			datetime: new Date().toISOString(),
		}).catch();
	}
}

export default RSA;
