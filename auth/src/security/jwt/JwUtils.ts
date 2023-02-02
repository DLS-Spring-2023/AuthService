import jwt, { SignOptions, VerifyOptions, Algorithm, JwtPayload } from "jsonwebtoken";

class JwtUtils {
    protected static readonly privateAccessKey  = Buffer.from(process.env.PRIVATE_ACCESS_KEY  || '').toString();
    public    static readonly publicAccessKey   = Buffer.from(process.env.PUBLIC_ACCESS_KEY   || '').toString();
    protected static readonly privateSessionKey = Buffer.from(process.env.PRIVATE_SESSION_KEY || '').toString();
    protected static readonly publicSessionKey  = Buffer.from(process.env.PUBLIC_SESSION_KEY  || '').toString();

    protected static accessTokenSignOptions: SignOptions = {
        issuer: 'jAuth',
        expiresIn: '15m',
        algorithm: "RS256" as Algorithm,
    }

    protected static sessionTokenSignOptions: SignOptions = {
        issuer: this.accessTokenSignOptions.issuer,
        expiresIn: `1y`,
        algorithm: "RS256" as Algorithm,
    }

    protected static accessTokenVerifyOptions: VerifyOptions = {
        issuer: this.accessTokenSignOptions.issuer,
        maxAge: this.accessTokenSignOptions.expiresIn,
        algorithms: [this.accessTokenSignOptions.algorithm as Algorithm],
    }

    protected static sessionTokenVerifyOptions: VerifyOptions = {
        issuer: this.sessionTokenSignOptions.issuer,
        algorithms: [this.sessionTokenSignOptions.algorithm as Algorithm],
    }

    public static decodeToken(token: string) {
        return jwt.decode(token) as JwtPayload;
    }

}

export default JwtUtils;