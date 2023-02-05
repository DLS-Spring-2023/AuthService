import { Pool } from "mariadb";
import { Keystore } from "../entity/Keystore";

class KeystoreRepo {
    private readonly db;

    constructor(db: Pool) {
        this.db = db;
    }

    /**
     * findById
     */
    public async findByProjectId(project_id: string): Promise<Keystore | undefined> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from keystore WHERE (project_id = ?);`, [project_id]);
        conn.release();

        return res[0];
    }

    /**
     * insert
     */
    public async insert(keystore: Keystore): Promise<Keystore | { error: string }> {
        const conn = await this.db.getConnection();

        const key = keystore.key as Buffer;
        
        const query = `INSERT INTO keystore (project_id, key) VALUES (?, ?);`;
        const prep = [keystore.project_id, key];

        let res;
        try {
            res = await conn.query(query, prep);
        } catch (err: any) {
            console.log(err);
            
            res = [{ error: err.code }];
        } finally {
            conn.release();
        }
        
        return res[0];
    }
}

export default KeystoreRepo;