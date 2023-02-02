import { Pool } from "mariadb";
import bcrypt from 'bcrypt';
import { Account } from "../../util/interfaces.js";
import Snowflake from "../../util/Snowflake.js";
import { OrgRole } from "../../util/enums.js";

class AccountRepo {
    private readonly db;

    constructor(db: Pool) {
        this.db = db;
    }

    /**
     * findById
     */
    public async findById(id: string) {
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
     * create
     */
    public async create(account: Account) {
        const conn = await this.db.getConnection();

        const pass = await bcrypt.hash(account.password_hash, 12);

        const organization_id = Snowflake.nextHexId();
        const account_id = Snowflake.nextHexId();

        const query = `
            INSERT INTO organization         (id, name)                                        VALUES (?, ?);
            INSERT INTO account              (id, name, email, password_hash, personal_org_id) VALUES (?, ?, ?, ?, ?) RETURNING *;
            INSERT INTO account_organization (account_id, organization_id, org_rolename)       VALUES (?, ?, ?);
        `;

        const prep = [
            organization_id, 'Personal Projects',                           // organization value
            account_id, account.name, account.email, pass, organization_id, // account values 
            account_id, organization_id, OrgRole.OWNER                      // join table values
        ];
        
        let res;
        try {
            const result = await conn.query(query, prep);
            res = result[1]
        } catch (err: any) {
            res = [{ error: err.code }];
        } finally {
            conn.release();
        }
        
        delete res[0].password_hash;
        return res[0];
    }

    /**
     * delete
     */
    public async delete(account: Account) {
        const conn = await this.db.getConnection();

        const query = `
            DELETE FROM account WHERE (id = ?);
            DELETE FROM organization WHERE (id = ?);
        `;
        
        const prep = [account.id, account.personal_org_id]

        const res = await conn.query(query, prep);
        conn.release();
        
        return res;
    }
}

export default AccountRepo;