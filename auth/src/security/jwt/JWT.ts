import jwt, { JwtPayload } from "jsonwebtoken";
import SessionRepo from "../../database/repo/SessionRepo.js";
import AccountRepo from "../../database/repo/AccountRepo.js";
import Snowflake from "../../util/Snowflake.js";
import db from "../../database/DatabaseGateway.js";
import { SessionTable } from "../../util/enums.js";
import UserRepo from "../../database/repo/UserRepo.js";
import JwtUtils from "./JwUtils.js";
import { Account } from "../../database/entity/Account.js";
import { User } from "../../database/entity/User.js";

interface IJWT {
    signAccessToken(account_id: string, session_id: bigint): Promise<string | null>;
    signNewSessionToken(account_id: string): Promise<{token: string, session_id: bigint}| null>;
    verifyAccessToken(token: string): Promise<{session_id: bigint, account: Account | User} | null>;
    // renewSessionToken(account_id: string, session: bigint): Promise<string | null>;
    // verifySessionToken(token: string): Promise<{session_id: bigint, account_id: string} | null>;
    // decodeToken(token: string): JwtPayload;
}

class JWT extends JwtUtils implements IJWT {
    
    private readonly sessionRepo: SessionRepo;
    private readonly accountRepo: AccountRepo | UserRepo;

    constructor (type: SessionTable) {
        super();
        
        if (type === SessionTable.ACCOUNT) {
            this.sessionRepo = db.accountSession;
            this.accountRepo = db.account;
        } else {
            this.sessionRepo = db.userSession;
            this.accountRepo = db.user;
        }
    }

    public signAccessToken(account_id: string, session_id: bigint) {
        return new Promise<string | null>((accept) => {
            jwt.sign({ session_id: String(session_id) }, JWT.privateAccessKey, { ...JWT.accessTokenSignOptions, subject: account_id}, async (error, encoded) => {
                if (error) accept(null);
                else       accept(encoded as string);
            });
        });
    }

    public signNewSessionToken(account_id: string) {
        const id = Snowflake.nextId();
        const session_id = Snowflake.nextId();
        const payload = { id: String(id), session_id: String(session_id) }

        return new Promise<{token: string, session_id: bigint} | null>((accept) => {
            jwt.sign(payload, JWT.privateSessionKey, { ...JWT.sessionTokenSignOptions, subject: account_id}, async (error, encoded) => {
                if (error || !encoded) accept(null);
                else {
                    const success = await this.sessionRepo.startNewSession({ id, session_id: session_id, account_id: account_id });
                    accept(success ? {token: encoded, session_id: session_id} : null);
                }
            });
        });
    }

    private renewSessionToken(account_id: string, session_id: bigint) {
        const id = Snowflake.nextId();
        const payload = { id: String(id), session_id }

        return new Promise<string | null>((accept) => {
            jwt.sign(payload, JWT.privateSessionKey, { ...JWT.sessionTokenSignOptions, subject: account_id}, async (error, encoded) => {
                if (error || !encoded) accept(null);
                else {
                    await this.sessionRepo.renewSession({id, account_id, session_id});
                    accept(encoded);
                }
            });
        });
    }

    public verifyAccessToken(token: string) {
        return new Promise<{session_id: bigint, account: Account | User} | null>((accept) => {
            jwt.verify(token, JWT.publicAccessKey, JWT.accessTokenVerifyOptions, async (error, decoded) => {
                if (error) {
                    accept(null);
                    return;
                }
                
                const { session_id, sub } = decoded as JwtPayload;
                if (!session_id || !sub) {
                    accept(null);
                    return;
                }

                const account = await this.accountRepo.findById(sub);
                if (!account || !account.enabled) {
                    accept(null);
                    return;
                }

                const accountSession = await this.sessionRepo.findValidBySessionId(BigInt(session_id));
                if (!accountSession) {
                    accept(null);
                    return;
                }
                
                accept({session_id, account});
                
            });
        });
    }

    private verifySessionToken(token: string) {
        return new Promise<{session_id: bigint, account: Account | User} | null>((accept) => {
            jwt.verify(token, JWT.publicSessionKey, JWT.sessionTokenVerifyOptions, async (error, decoded) => {
                if (error) {
                    console.error("RefreshToken:", "VerifyError -", error)
                    accept(null);
                    return;
                }

                const { id, session_id, sub } = decoded as JwtPayload;
                if (!id || !sub || !session_id) {
                    accept(null);
                    return;
                }

                // If account/user doesn't exist or is banned, delete all related session tokens
                const account = await this.accountRepo.findById(sub);
                if (!account || !account.enabled) {
                    await this.sessionRepo.deleteByUserId(sub);
                    accept(null);
                    return;
                }

                const session = await this.sessionRepo.findById(BigInt(id));
                
                if (!session || !session.expires) {
                    accept(null);
                    return;
                }

                // If token is expired or invalid, kill session
                const expired = new Date(Number.parseInt(session.expires.toString())).getTime() < Date.now();
                if (expired || !session.valid) {
                    this.sessionRepo.killSession(session_id);
                    accept(null);
                    return;
                }
                
                accept({ session_id, account });
            });
        });
    }

    /**
     * Verifies, invalidates and renews session
     */
    public async validateAndRenewSession(token: string): Promise<{ token: string, account: Account | User, session_id: bigint } | null> {
        const verified = await this.verifySessionToken(token);
        if (!verified || !verified.account.id) return null;

        const newToken = await this.renewSessionToken(verified.account.id, verified.session_id);
        if (!newToken) return null;

        return { 
            token: newToken, 
            session_id: verified.session_id,
            account: verified.account,
        };
    }
}

export const AccountJWT = new JWT(SessionTable.ACCOUNT);
export const UserJWT    = new JWT(SessionTable.USER);