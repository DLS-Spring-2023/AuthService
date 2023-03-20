import bcrypt from 'bcrypt';
import Snowflake from "../../util/Snowflake.js";
import { PrismaClient, User } from "@prisma/client";

class UserRepo {
    private readonly db;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    /**
     * findById
     */
    public async findById(id: string): Promise<User | null> {
        return await this.db.user.findUnique({
            where: {
                id: id
            }
        });
    }

    /**
     * findByProjectId
     */
    public async findByProjectId(project_id: string): Promise<User[]> {
        return await this.db.user.findMany({
            where: {
                project_id: project_id
            },
        });
    }

    /**
     * findByEmail
     */
    public async findByEmail(email: string): Promise<User | null> {
        return await this.db.user.findFirst({
            where: {
                email: email
            }
        });
    }

    /**
     * create
     */
    public async create(user: User): Promise<User | { error: string }> {
        return await this.db.user.create({
            data: {
                id: Snowflake.nextHexId(),
                project_id: user.project_id,
                name: user.name,
                email: user.email,
                password_hash: await bcrypt.hash(user.password_hash as string, 12)
            }
        });
    }

    /**
     * update
     */
    public async update(user: User): Promise<User> {
        return await this.db.user.update({
            where: {
                id: user.id
            },
            data: {
                name: user.name,
                email: user.email,
                password_hash: user.password_hash,
                enabled: user.enabled,
                verified: user.verified
            }
        });
    }

    /**
     * delete
     */
    public async delete(id: string): Promise<User> {
        return await this.db.user.delete({
            where: {
                id: id
            }
        });
    }
}

export default UserRepo;