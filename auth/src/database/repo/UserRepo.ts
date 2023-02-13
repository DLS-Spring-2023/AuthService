import { Pool } from "mariadb";
import bcrypt from 'bcrypt';
import Snowflake from "../../util/Snowflake.js";
import { User } from "../entity/User.js";

class UserRepo {
    private readonly db;

    constructor(db: Pool) {
        this.db = db;
    }

    /**
     * findById
     */
    public async findById(id: string): Promise<User | undefined> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from user WHERE (id = ?);`, [id]);
        conn.release();

        if (res[0]) {
            res[0].enabled = res[0].enabled === 1;
            res[0].verified = res[0].verified === 1;
        }

        return res[0];
    }

    /**
     * findByProjectId
     */
    public async findByProjectId(project_id: string): Promise<User[]> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from user WHERE (project_id = ?);`, [project_id]);
        conn.release();

        for (const user of res) {
            user.enabled = user.enabled === 1;
            user.verified = user.verified === 1;
        }

        return res;
    }

    /**
     * findByEmail
     */
    public async findByEmail(email: string): Promise<User | undefined> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query("SELECT * from user WHERE (email = ?);", [email]);
        conn.release();

        if (res[0]) {
            res[0].enabled = res[0].enabled === 1;
            res[0].verified = res[0].verified === 1;
        }

        return res[0];
    }

    /**
     * create
     */
    public async create(user: User): Promise<User | { error: string }> {
        const conn = await this.db.getConnection();

        user.password_hash = await bcrypt.hash(user.password_hash as string, 12);

        const query = "INSERT INTO user (id, project_id, name, email, password_hash) VALUES (?, ?, ?, ?, ?) RETURNING *;";
        const prepared  = [Snowflake.nextHexId(), user.project_id, user.name, user.email, user.password_hash];
        
        let res;
        try {
            res = await conn.query(query, prepared);
        } catch (err: any) {
            res = [{error: err.code}];
        } finally {
            conn.release();
        }

        if (res[0]) {
            res[0].enabled = res[0].enabled === 1;
            res[0].verified = res[0].verified === 1;
        }

        return res[0];
    }

    /**
     * update
     */
    public async update(user: User): Promise<boolean | { error: string }> {
        const conn = await this.db.getConnection();

        const query = "UPDATE user SET name = ?, email = ?, password_hash = ?, enabled = ?, verified = ? WHERE (id = ?);";
        const prep = [user.name, user.email, user.password_hash, user.enabled, user.verified, user.id];

        let res;
        try {
            res = await conn.query(query, prep);
        } catch (err: any) {
            console.log(err);
            
            return { error: err.code };
        } finally {
            conn.release();
        }
        
        const { affectedRows } = Object.getOwnPropertyDescriptors(res);
        return affectedRows.value === 1; // if true, success
    }

    /**
     * delete
     */
    public async delete(id: string): Promise<boolean> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query("DELETE FROM user WHERE (id = ?)", [id]);
        conn.release();
        
        const { affectedRows } = Object.getOwnPropertyDescriptors(res);
        return affectedRows.value === 1; // if true, success
    }
}

export default UserRepo;