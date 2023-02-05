import { Pool } from "mariadb";
import bcrypt from 'bcrypt';
import Snowflake from "../../util/Snowflake.js";
import { Account } from "../entity/Account.js";

class AccountRepo {
    private readonly db;

    constructor(db: Pool) {
        this.db = db;
    }

    /**
     * count
     */
    public async count(): Promise<bigint> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT COUNT(*) FROM account;`);
        conn.release();

        return BigInt(res[0]['COUNT(*)']);
    }

    /**
     * findById
     */
    public async findById(id: string): Promise<Account | undefined> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from account WHERE (id = ?);`, [id]);
        conn.release();

        return res[0];
    }

    /**
     * findByEmail
     */
    public async findByEmail(email: string): Promise<Account | undefined> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query("SELECT * from account WHERE (email = ?);", [email]);
        conn.release();

        return res[0];
    }

    /**
     * insert
     */
    public async insert(account: Account): Promise<Account | { error: string }> {
        const conn = await this.db.getConnection();

        const pass = await bcrypt.hash(account.password_hash as string, 12);
        const id = Snowflake.nextHexId();

        const query = `INSERT INTO account (id, name, email, password_hash) VALUES (?, ?, ?, ?) RETURNING *;`;
        const prep = [id, account.name, account.email, pass];
        
        let res;
        try {
            const result = await conn.query(query, prep);
            res = result[0] ? new Account(result[0]) : result[0]
        } catch (err: any) {
            res = [{ error: err.code }];
        } finally {
            conn.release();
        }
        
        return res;
    }

    /**
     * update
     */
    public async update(account: Account): Promise<boolean | { error: string }> {
        const conn = await this.db.getConnection();

        const query = `UPDATE account SET name = ?, email = ?, password_hash = ?, enabled = ? WHERE (id = ?);`;
        const prep = [account.name, account.email, account.password_hash, account.enabled, account.id];
        
        let res;
        try {
            res = await conn.query(query, prep);
        } catch (err: any) {
            res = { error: err.code };
        } finally {
            conn.release();
        }

        const { affectedRows } = Object.getOwnPropertyDescriptors(res);
        return affectedRows.value === 1; // if true, success
    }

    /**
     * delete
     */
    public async delete(account: Account): Promise<boolean> {
        const conn = await this.db.getConnection();

        const query = `DELETE FROM account WHERE (id = ?);`;
        const prep = [account.id]

        const res = await conn.query(query, prep);
        conn.release();
        
        const { affectedRows } = Object.getOwnPropertyDescriptors(res);
        return affectedRows.value === 1; // if true, success
    }
}

export default AccountRepo;