import { Pool } from "mariadb";
import bcrypt from 'bcrypt';
import { User } from "../../util/interfaces.js";
import Snowflake from "../../util/Snowflake.js";

class UserRepo {
    private readonly db;

    constructor(db: Pool) {
        this.db = db;
    }

    /**
     * findById
     */
    public async findById(id: string) {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from user WHERE (id = ?);`, [id]);
        conn.release();

        return res[0];
    }

    /**
     * findByEmail
     */
    public async findByEmail(email: string) {
        const conn = await this.db.getConnection();
        
        const res = await conn.query("SELECT * from user WHERE (email = ?);", [email]);
        conn.release();

        return res[0];
    }

    /**
     * create
     */
    public async create(user: User) {
        const conn = await this.db.getConnection();

        const pass = await bcrypt.hash(user.password_hash, 12);

        const query = "INSERT INTO user (id, project_id, name, email, password_hash) VALUE (?, ?, ?, ?)";
        const prepared  = [Snowflake.nextHexId(), user.project_id, user.name, user.email, pass ];

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
    public async delete(id: string) {
        const conn = await this.db.getConnection();
        
        const res = await conn.query("DELETE FROM user WHERE (id = ?)", [id]);
        conn.release();
        
        return res;
    }
}

export default UserRepo;