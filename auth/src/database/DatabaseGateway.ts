import AccountRepo from './repo/AccountRepo.js';
import { SessionTable } from '../util/enums.js';
import SessionRepo from './repo/SessionRepo.js';
import UserRepo from './repo/UserRepo.js';
import ProjectRepo from './repo/ProjectRepo.js';
import KeystoreRepo from './repo/KeystoreRepo.js';
import { PrismaClient } from '@prisma/client';
// import SettingsRepo from './repo/SettingsRepo.js';

class DatabaseGateway {
    // private readonly pool = db.createPool({
    //     host: process.env.DB_HOST, 
    //     port: Number.parseInt(process.env.DB_PORT || '3306'),
    //     database: process.env.DB_SCHEMA,
    //     user: process.env.DB_USER, 
    //     password: process.env.DB_PASS,
    //     connectionLimit: 5,
    //     multipleStatements: true,
    // });

    private readonly db = new PrismaClient();

    public readonly account = new AccountRepo(this.db);
    public readonly accountSession = new SessionRepo(this.db, SessionTable.ACCOUNT);
    public readonly user = new UserRepo(this.db);
    public readonly userSession = new SessionRepo(this.db, SessionTable.USER);
    public readonly project = new ProjectRepo(this.db);
    public readonly keystore = new KeystoreRepo(this.db);

    // Initialize Database
    // Does not catch errors as we want the server to crash in case initialization failed!
    async init() {
        // const schema = fs.readFileSync(path.resolve('./src/database/setup/schema.sql'));
        
        // const conn = await this.pool.getConnection();
        
        // // await this.drop(conn);
        // await conn.query(schema.toString());
        // await conn.release();

        // await this.serverSettings.init();
    }

    // private async drop(conn: Connection) {
    //     const schema = fs.readFileSync(path.resolve('./src/database/setup/drop-db.sql'));
    //     await conn.query(schema.toString());
    // }
}

export default new DatabaseGateway();