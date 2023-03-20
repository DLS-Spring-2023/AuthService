import { Keystore, PrismaClient } from "@prisma/client";

class KeystoreRepo {
    private readonly db;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    /**
     * findById
     */
    public async findByProjectId(project_id: string): Promise<Keystore | null> {
        return await this.db.keystore.findUnique({
            where: {
                project_id: project_id
            }
        });
    }

    /**
     * insert
     */
    public async insert(keystore: Keystore): Promise<Keystore | { error: string }> {
        return await this.db.keystore.create({
            data: {
                project_id: keystore.project_id,
                api_key: keystore.api_key,
                jwt_pub_key: keystore.jwt_pub_key,
                jwt_prv_key: keystore.jwt_prv_key,
            }
        });
    }
}

export default KeystoreRepo;