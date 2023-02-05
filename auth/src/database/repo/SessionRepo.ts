import { Pool } from "mariadb";
import { SessionTable } from "../../util/enums.js";
import { AccountSession } from "../entity/AccountSession.js";
import { UserSession } from "../entity/UserSession.js";

class SessionRepo {
    private readonly db;
    private readonly table: SessionTable;

    constructor(db: Pool, table: SessionTable) {
        this.db = db;
        this.table = table;
    }
    
    /**
     * findById
     */
    public async findById(id: bigint): Promise<AccountSession | UserSession | undefined> {
        const conn = await this.db.getConnection();

        const result = await conn.query(`SELECT * FROM ${this.table}_session WHERE (id = ?) LIMIT 1;`, [id]);
        
        conn.release();
        return result[0];
    }

    /**
     * findValidBySessionId
     */
    public async findValidBySessionId(session_id: bigint): Promise<AccountSession | UserSession | undefined> {
        const conn = await this.db.getConnection();

        const result = await conn.query(`SELECT * FROM ${this.table}_session WHERE (session_id = ?) AND (valid = 1) LIMIT 1;`, [session_id]);

        conn.release();
        return result[0];
    }

    /**
     * save
     */
    public async startNewSession(session: AccountSession | UserSession): Promise<boolean> {
        const conn = await this.db.getConnection();

        const expires = new Date(Date.now() + (1000 * 60 * 60 * 24 * 365) - (1000 * 60)); // one year minus a minute

        const query = `INSERT INTO ${this.table}_session (id, session_id, ${this.table}_id, expires) VALUES (?, ?, ?, ?)`;
        const prep = [session.id, session.session_id, session.account_id, expires];
        const res = await conn.query(query, prep);
        
        conn.release();

        const { affectedRows } = Object.getOwnPropertyDescriptors(res);
        return affectedRows.value === 1; // if true, success
    }

    /**
     * renewSession
     */
    public async renewSession(session: AccountSession | UserSession): Promise<boolean> {
        const conn = await this.db.getConnection();

        // Find last valid session iteration
        let query = `SELECT MAX(iteration) from ${this.table}_session WHERE (session_id = ?) AND (valid = 1)`;
        const lastIteration = await conn.query(query, [session.session_id]);
        
        // Kill session if no valid iteration is found and return
        const maxIteration = lastIteration[0]['MAX(iteration)'];
        if (!maxIteration) {
            this.killSession(session.session_id as bigint);
            return false;
        };

        // Invalidate earlier iterations
        query = `UPDATE ${this.table}_session SET valid = 0 WHERE (session_id = ?) AND (valid = 1)`;
        await conn.query(query, [session.session_id]);
        
        // Insert new session iteration
        query = `INSERT INTO ${this.table}_session (id, session_id, ${this.table}_id, iteration, expires) VALUES (?, ?, ?, ?, ?)`;
        const expires = new Date(Date.now() + (1000 * 60 * 60 * 24 * 365) - (1000 * 60)); // one year minus a minute
        const nextIteration = maxIteration + 1;
        const res = await conn.query(query, [session.id, session.session_id, session.account_id, nextIteration, expires]);

        conn.release();
        
        const { affectedRows } = Object.getOwnPropertyDescriptors(res);
        return affectedRows.value === 1; // if true, success
    }

    /**
     * killSession
     */
    public async killSession(session_id: bigint) {
        const conn = await this.db.getConnection();

        const res = await conn.query(`DELETE FROM ${this.table}_session WHERE (session_id = ?)`, [session_id]);
        conn.release();
        
        const { affectedRows } = Object.getOwnPropertyDescriptors(res);
        return affectedRows.value === 1; // if true, success
    }

    /**
     * deleteByUserId
     */
    public async deleteByUserId(id: string) {
        const conn = await this.db.getConnection();

        const result = await conn.query(`DELETE FROM ${this.table}_session WHERE (${this.table}_id = ?)`, [id]);
        conn.release();
        return result;
    }

}

export default SessionRepo;