import { Router } from 'express';
import JwtUtils from '../../../security/jwt/JwUtils.js';

const router = Router();

router.get('/access', (_, res) => {
	res.send(JwtUtils.publicAccessKey);
});

export default router;
