import ParserSchemas from "./ParserSchemas.js";

class BodyParser extends ParserSchemas {

    parseUpdateAccount(data: {name: string, email: string, oldPassword: string, newPassword: string}) {
        try {
            return this.updateAccount.parse(data);
        } catch (err: any) {
            const log: { [key: string]: any } = { error: true }
            for (const error of err.errors) {
                log[error.path[0]] = { message: error.message };
            }
            return log;
        }
    }

    parseCreateUser(data: {name: string, email: string, password: string}) {
        try {
            return this.createUser.parse(data);
        } catch (err: any) {
            const log: { [key: string]: any } = { error: true }
            for (const error of err.errors) {
                log[error.path[0]] = error.message;
            }
            return log;
        }
    }
}

export default new BodyParser();