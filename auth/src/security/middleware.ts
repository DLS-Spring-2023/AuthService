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
                name: verifiedAccess.account.name, 
                email: verifiedAccess.account.email,
                personalOrgId: verifiedAccess.account.personal_org_id || '',
            }
        };
        next();
        return;
    } 

    // Verify session token if access was not verified
    const verifiedSession = sessionToken ? await AccountJWT.validateAndRenewSession(sessionToken) : null;
    if (verifiedSession && verifiedSession.account.id) {
        
        accessToken = await AccountJWT.signAccessToken(verifiedSession.account.id, verifiedSession.session_id);
        req.auth = { 
            accessToken, 
            sessionToken, 
            user: {
                id: verifiedSession.account.id, 
                name: verifiedSession.account.name, 
                email: verifiedSession.account.email, 
                personalOrgId: verifiedSession.account.personal_org_id || '',
                didTokensRefresh: true 
            }
        };
        next();
    } else {
        res.status(401).send({ code: 401, message: "Unauthorized" });
    }
}