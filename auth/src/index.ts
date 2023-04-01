import express from 'express';
import cookies from 'cookie-parser';
import db from './database/DatabaseGateway.js';
import router from './router/router.js';
import { Project } from '@prisma/client';

declare module 'express-serve-static-core' {
	interface Request {
		auth: {
			accessToken: string;
			sessionToken: string;
			didTokensRefresh?: boolean;
			user: {
				id: string;
				name: string;
				email: string;
			};
		};
		project: Project;
	}
}

// Initialize Database
await db.init();

const server = express();

server.use(express.json());
server.use(cookies());

server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log('Auth server came online at port', PORT);
});
