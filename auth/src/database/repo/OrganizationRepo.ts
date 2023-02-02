import { Pool } from "mariadb";
import { OrgRole } from "../../util/enums.js";
import Snowflake from "../../util/Snowflake.js";

class OrganizationRepo {
    private readonly db;

    constructor(db: Pool) {
        this.db = db;
    }

    /**
     * findById
     */
    public async findById(id: string) {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * from organization WHERE (id = ?);`, [id]);
        conn.release();

        return res[0];
    }

    /**
     * create
     */
    public async create(owner_id: string, name: string) {
        const conn = await this.db.getConnection();

        const organization_id = Snowflake.nextHexId();

        const query = `
            INSERT INTO organization (id, name) VALUE (?, ?) RETURNING *;
            INSERT INTO account_organization (account_id, organization_id, org_rolename) VALUE (?, ?, ?);
        `;

        const prep = [
            organization_id, name, // organization values
            owner_id, organization_id, OrgRole.OWNER // join table values
        ];

        let res;
        try {
            res = await conn.query(query, prep);
        } catch (err: any) {
            res = [{ error: err.code }];
        } finally {
            conn.release();
        }

        return res[0][0];
    }

    /**
     * isMember
     */
    public async isMember(account_id: string, organization_id: string) {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * FROM account_organization WHERE (account_id = ?) AND (organization_id = ?);`, [account_id, organization_id]);
        conn.release();

        return res.length > 0;
    }

    /**
     * isOwner
     */
    public async isOwner(account_id: string, organization_id: string) {
        const conn = await this.db.getConnection();
        
        const res = await conn.query(`SELECT * FROM account_organization WHERE (account_id = ?) AND (organization_id = ?) AND (org_rolename);`, [account_id, organization_id, OrgRole.OWNER]);
        conn.release();

        return res.length > 0;
    }
}

export default OrganizationRepo;