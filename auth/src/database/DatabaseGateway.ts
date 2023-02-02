import db from 'mariadb';
import AccountRepo from './repo/AccountRepo.js';
import path from 'path';
import fs from 'fs';
import { Settings } from '../util/interfaces.js';
import { SessionTable } from '../util/enums.js';
import SessionRepo from './repo/SessionRepo.js';
import UserRepo from './repo/UserRepo.js';
import ProjectRepo from './repo/ProjectRepo.js';
import OrganizationRepo from './repo/OrganizationRepo.js';

class DatabaseGateway {
    private readonly pool = db.createPool({
        host: process.env.DB_HOST, 
        port: Number.parseInt(process.env.DB_PORT || '3306'),
        database: process.env.DB_SCHEMA,
        user: process.env.DB_USER, 
        password: process.env.DB_PASS,
        connectionLimit: 5,
        multipleStatements: true,
    });

    public readonly account = new AccountRepo(this.pool);
    public readonly accountSession = new SessionRepo(this.pool, SessionTable.ACCOUNT);
    public readonly organization = new OrganizationRepo(this.pool);
    public readonly user = new UserRepo(this.pool);
    public readonly userSession = new SessionRepo(this.pool, SessionTable.USER);
    public readonly project = new ProjectRepo(this.pool);

    // Initialize Database
    // Does not catch errors as we want the server to crash in case initialization failed!
    async init() {
        const schema = fs.readFileSync(path.resolve('./src/database/setup/schema.sql'));
        // const schema = fs.readFileSync(path.resolve('./src/database/setup/drop-db.sql'));
        
        const conn = await this.pool.getConnection();
        await conn.query(schema.toString());

        const settings: Settings[] = await conn.query('SELECT * from settings');
        if (settings.length === 0) {
            await conn.query('INSERT INTO settings () VALUES ();');
        }

        await conn.release();
    }
}

export default new DatabaseGateway();