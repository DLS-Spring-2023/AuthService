import { Pool } from "mariadb";
import Snowflake from "../../util/Snowflake.js";

class ProjectRepo {
    private readonly db;

    constructor(db: Pool) {
        this.db = db;
    }

    /**
     * findById
     */
    public async findById(id: string) {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from project WHERE (id = ?) LIMIT 1;`, [id]);
        conn.release();

        return res[0];
    }

    /**
     * findByOrgId
     */
    public async findByAccountId(id: string) {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from project WHERE (account_id = ?);`, [id]);
        conn.release();

        delete res.meta;
        
        return res;
    }

    /**
     * create
     */
    public async create(name: string, account_id: string) {
        const conn = await this.db.getConnection();

        const id = Snowflake.nextHexId();
        
        const query = `INSERT INTO project (id, account_id, name) VALUES (?, ?, ?) RETURNING *;`;
        const prep  = [id, account_id, name];

        let res;
        try {
            const result = await conn.query(query, prep);
            res = result[0]
        } catch (err: any) {
            res = [{ error: err.code }];
        } finally {
            conn.release();
        }

        console.log(res);
        

        return res;
    }

}

export default ProjectRepo;
