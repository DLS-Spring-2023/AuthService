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

        return res[0];
    }

    /**
     * findByProjectId
     */
    public async findByProjectId(project_id: string): Promise<User[]> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from user WHERE (project_id = ?);`, [project_id]);
        conn.release();

        return res;
    }

    /**
     * findByEmail
     */
    public async findByEmail(email: string): Promise<User | undefined> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query("SELECT * from user WHERE (email = ?);", [email]);
        conn.release();

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

        return res[0];
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