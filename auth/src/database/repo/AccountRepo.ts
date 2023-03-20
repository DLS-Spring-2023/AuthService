import bcrypt from 'bcrypt';
import Snowflake from "../../util/Snowflake.js";
import { Account, PrismaClient } from "@prisma/client";

class AccountRepo {
    private readonly db;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    /**
     * count
     */
    public async count(): Promise<bigint> {
        return BigInt(await this.db.account.count());
    }

    /**
     * findById
     */
    public async findById(id: string): Promise<Account | null> {
        return await this.db.account.findUnique({
            where: {
                id: id
            }
        });
    }

    /**
     * findByEmail
     */
    public async findByEmail(email: string): Promise<Account | null> {
        return await this.db.account.findUnique({
            where: {
                email: email
            }
        });
    }

    /**
     * insert
     */
    public async insert(account: Account): Promise<Account | { error: string }> {
        return await this.db.account.create({
            data: {
                id: Snowflake.nextHexId(),
                name: account.name,
                email: account.email,
                password_hash: await bcrypt.hash(account.password_hash as string, 12),
                enabled: account.enabled
            }
        });
    }

    /**
     * update
     */
    public async update(account: Account): Promise<Account> {
        return await this.db.account.update({
            where: {
                id: account.id
            },
            data: {
                name: account.name,
                email: account.email,
                password_hash: account.password_hash,
                enabled: account.enabled
            }
        });
    }

    /**
     * delete
     */
    //   
    public async delete(account: Account): Promise<Account> {
        return await this.db.account.delete({
            where: {
                id: account.id
            }
        });
    }
}

export default AccountRepo;