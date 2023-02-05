import { Pool } from "mariadb";
import Snowflake from "../../util/Snowflake.js";
import { Project } from "../entity/Project.js";

class ProjectRepo {
    private readonly db;

    constructor(db: Pool) {
        this.db = db;
    }

    /**
     * findById
     */
    public async findById(id: string): Promise<Project | undefined> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from project WHERE (id = ?) LIMIT 1;`, [id]);
        conn.release();

        return res[0];
    }

    /**
     * findByOrgId
     */
    public async findByAccountId(id: string): Promise<Project | undefined> {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from project WHERE (account_id = ?);`, [id]);
        conn.release();

        delete res.meta;
        
        return res;
    }

    /**
     * create
     */
    public async create(name: string, account_id: string): Promise<Project | { error: string }> {
        const conn = await this.db.getConnection();

        const id = Snowflake.nextHexId();
        
        const query = `INSERT INTO project (id, account_id, name) VALUES (?, ?, ?) RETURNING *;`;
        const prep  = [id, account_id, name];

        let res;
        try {
            const result = await conn.query(query, prep);
            res = result[0]
        } catch (err: any) {
            res = { error: err.code };
        } finally {
            conn.release();
        }
        
        return res ? new Project(res) : res;
    }

    /**
     * update
     */
    public async update(project: Project): Promise<boolean | { error: string }> {
        const conn = await this.db.getConnection();

        const query = `UPDATE project SET name = ? WHERE (id = ?);`;
        const prep = [project.name, project.id];
        
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
    public async delete(project: Project): Promise<boolean> {
        const conn = await this.db.getConnection();

        const query = `DELETE FROM project WHERE (id = ?);`;
        const prep = [project.id]

        const res = await conn.query(query, prep);
        conn.release();

        const { affectedRows } = Object.getOwnPropertyDescriptors(res);
        return affectedRows.value === 1; // if true, success
    }

}

export default ProjectRepo;
