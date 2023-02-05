interface IUser {
    id?:            string;
    project_id?:    string;
    name?:          string;
    email?:         string;
    password_hash?: string;
    role?:          string;
    created_at?:    Date;
    updated_at?:    Date;
    enabled?:       boolean;
    verified?:      boolean;
}

export class User {
    id?:            string;
    project_id?:    string;
    name?:          string;
    email?:         string;
    password_hash?: string;
    role?:          string;
    created_at?:    Date;
    updated_at?:    Date;
    enabled?:       boolean;
    verified?:      boolean;

    constructor(data: IUser) {
        this.id            = data.id;
        this.project_id    = data.project_id;
        this.name          = data.name;
        this.email         = data.email;
        this.password_hash = data.password_hash;
        this.role          = data.role;
        this.created_at    = data.created_at;
        this.updated_at    = data.updated_at;
        this.enabled       = data.enabled;
        this.verified      = data.verified;
    }
}