import { PrismaClient, Project } from '@prisma/client';
import Snowflake from '../../util/Snowflake.js';
import RSA from '../../security/keygen/RSA.js';

class ProjectRepo {
	private readonly db;

	constructor(db: PrismaClient) {
		this.db = db;
	}

	/**
	 * findById
	 */
	public async findById(id: string): Promise<Project | null> {
		return await this.db.project.findUnique({
			where: {
				id
			},
			include: {
				keystore: {
					select: { api_key: true }
				}
			}
		});
	}

	/**
	 * findByOrgId
	 */
	public async findByAccountId(id: string): Promise<Project[] | null> {
		return await this.db.project.findMany({
			where: {
				account_id: id
			}
		});
	}

	/**
	 * findByAPIKey
	 */
	public async findByAPIKey(api_key: string) {
		return await this.db.project.findFirst({
			where: {
				keystore: { api_key }
			}
		});
	}

	/**
	 * create
	 */
	public async create(name: string, account_id: string): Promise<Project | null> {
		const rsa = new RSA();
		const encryptedPrivateKey = RSA.encrypt(rsa.getPrivateKey());
		const encryptedPublicKey = RSA.encrypt(rsa.getPublicKey());
		const iv = RSA.getIv();

		return await this.db.project
			.create({
				data: {
					id: Snowflake.nextHexId(),
					name,
					account_id,
					keystore: {
						create: {
							iv: iv,
							private_key: encryptedPrivateKey.toString('hex'),
							public_key: encryptedPublicKey.toString('hex')
						} as { iv: string; private_key: string; public_key: string; api_key: string }
					}
				}
			})
			.catch((err) => {
				console.log('ProjectRepo.create error:');
				console.log(err);
				return null;
			});
	}

	/**
	 * update
	 */
	public async update(project: Project): Promise<Project | null> {
		return await this.db.project
			.update({
				where: {
					id: project.id
				},
				data: {
					name: project.name
				}
			})
			.catch((err) => {
				console.log('ProjectRepo.update error:');
				console.log(err);
				return null;
			});
	}

	/**
	 * delete
	 */
	public async delete(project: Project): Promise<Project> {
		return await this.db.project.delete({
			where: {
				id: project.id
			}
		});
	}
}

export default ProjectRepo;
