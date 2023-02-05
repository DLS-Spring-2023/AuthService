interface IAccount {
    id?:             string;
    name?:           string;
    email?:          string; 
    password_hash?:  string;
    created_at?:     Date;
    updated_at?:     Date;
    enabled?:        boolean;
}

export class Account implements IAccount {
    id:             string  | undefined;
    name:           string  | undefined
    email:          string  | undefined; 
    password_hash:  string  | undefined;
    created_at:     Date    | undefined;
    updated_at:     Date    | undefined;
    enabled:        boolean | undefined;

    constructor(data: IAccount) {
        this.id            = data.id;
        this.name          = data.name;
        this.email         = data.email;
        this.password_hash = data.password_hash;
        this.created_at    = data.created_at;
        this.updated_at    = data.updated_at;
        this.enabled       = data.enabled;
    }
}