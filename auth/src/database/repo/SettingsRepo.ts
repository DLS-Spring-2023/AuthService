import { Pool } from "mariadb";
import { Settings } from "../../util/interfaces";

class SettingsRepo {

    private readonly db;

    constructor(db: Pool) {
        this.db = db;
    }

    /**
     * init
     */
    public async init() {
        const conn = await this.db.getConnection();

        const settings: Settings[] = await conn.query('SELECT * from server_settings');
        if (settings.length === 0) {
            await conn.query('INSERT INTO server_settings () VALUES ();');
        }

        await conn.release();
    }
}

export default SettingsRepo;