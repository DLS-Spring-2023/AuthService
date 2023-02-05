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
    public async count() {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT COUNT(*) FROM account;`);
        conn.release();

        return BigInt(res[0]['COUNT(*)']);
    }

    /**
     * findById
     */
    public async findById(id: string): Promise<Account> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from account WHERE (id = ?);`, [id]);
        conn.release();

        return res[0];
    }

    /**
     * findByEmail
     */
    public async findByEmail(email: string) {
        const conn = await this.db.getConnection();
        
        const res = await conn.query("SELECT * from account WHERE (email = ?);", [email]);
        conn.release();

        return res[0];
    }

    /**
     * insert
     */
    public async insert(account: Account) {
        const conn = await this.db.getConnection();

        const pass = await bcrypt.hash(account.password_hash as string, 12);
        const id = Snowflake.nextHexId();

        const query = `INSERT INTO account (id, name, email, password_hash) VALUES (?, ?, ?, ?) RETURNING *;`;
        const prep = [id, account.name, account.email, pass];
        
        let res;
        try {
            res = await conn.query(query, prep);
        } catch (err: any) {
            res = [{ error: err.code }];
        } finally {
            conn.release();
        }
        
        return res[0];
    }

    /**
     * update
     */
    public async update(account: Account) {
        const conn = await this.db.getConnection();

        const query = `UPDATE account SET name = ?, email = ?, password_hash = ?, enabled = ? WHERE (id = ?);`;
        const prep = [account.name, account.email, account.password_hash, account.enabled, account.id];
        
        let res;
        try {
            await conn.query(query, prep);
            res = { error: false };
        } catch (err: any) {
            res = { error: err.code };
        } finally {
            conn.release();
        }
       
        return res;
    }

    /**
     * delete
     */
    public async delete(account: Account) {
        const conn = await this.db.getConnection();

        const query = `DELETE FROM account WHERE (id = ?);`;
        const prep = [account.id]

        const res = await conn.query(query, prep);
        conn.release();
        
        return res;
    }
}

export default AccountRepo;