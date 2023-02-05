interface IProject {
    id?:         string;
    account_id?: string;
    name?:       string; 
    created_at?: Date;
    updated_at?: Date;
}

export class Project implements IProject {
    id?:         string | undefined;
    account_id?: string | undefined;
    name?:       string | undefined; 
    created_at?: Date   | undefined;
    updated_at?: Date   | undefined;

    constructor(data: IProject) {
        this.id         = data.id;
        this.account_id = data.account_id;
        this.name       = data.name;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
}