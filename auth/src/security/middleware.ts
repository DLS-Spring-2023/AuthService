import { NextFunction, Request, Response } from "express";
import { AccountJWT } from "./jwt/JWT.js";

export const authenticateAccount = async (req: Request, res: Response, next: NextFunction) => {
    let accessToken  = req.cookies.account_access_token;
    let sessionToken = req.cookies.account_session_token;

    if (!accessToken) accessToken  = req.body.accessToken;
    if (!sessionToken) sessionToken = req.body.sessiontoken;

    // Verify access token
    const verifiedAccess = accessToken ? await AccountJWT.verifyAccessToken(accessToken) : null;
    if (verifiedAccess && verifiedAccess.account.id) {
        req.auth = { 
            accessToken, 
            sessionToken,
            user: {
                id: verifiedAccess.account.id, 
                name: verifiedAccess.account.name as string, 
                email: verifiedAccess.account.email as string,
            }
        };
        next();
        return;
    } 

    // Verify session token if access was not verified
    const verifiedSession = sessionToken ? await AccountJWT.validateAndRenewSession(sessionToken) : null;
    if (verifiedSession && verifiedSession.token && verifiedSession.account.id) {
        
        accessToken = await AccountJWT.signAccessToken(verifiedSession.account.id, verifiedSession.session_id);
        req.auth = { 
            accessToken,
            sessionToken: verifiedSession.token, 
            didTokensRefresh: true,
            user: {
                id: verifiedSession.account.id, 
                name: verifiedSession.account.name as string, 
                email: verifiedSession.account.email as string, 
            }
        };

        res.cookie('account_access_token', accessToken, {
            maxAge: 1000 * 60 * 15 - 10,
            httpOnly: true,
            secure: false, // TODO
            path: '/',
            sameSite: 'lax'
        });
    
        res.cookie('account_session_token', verifiedSession.token, {
            maxAge: 1000 * 60 * 60 * 24 * 365 - 1000 * 10,
            httpOnly: true,
            secure: false, // TODO
            path: '/',
            sameSite: 'lax'
        });

        next();
    } else {
        res.status(401).send({ code: 401, message: "Unauthorized" });
    }
}