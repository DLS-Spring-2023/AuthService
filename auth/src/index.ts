import express from 'express';
import cookies from 'cookie-parser';
import db from './database/DatabaseGateway.js';
import router from './router/router.js';

declare module "express-serve-static-core" {
    interface Request {
        auth: {
            accessToken: string;
            sessionToken: string;
            user: {
                id: string;
                name: string;
                email: string;
                personalOrgId: string;
                didTokensRefresh?: boolean;
            }
        }
    }
}

// Initialize Database
await db.init();

const server = express();

server.use(express.json());
server.use(cookies());

const REQUIRE_AUTH = !!Number.parseInt(process.env.REQUIRE_AUTH || '1');
server.get('/status', (req, res) => {
    res.send(REQUIRE_AUTH);
});

server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Auth server came online at port', PORT);
});