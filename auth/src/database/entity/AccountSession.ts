interface IAccountSession {
    id?:         bigint;
    session_id?: bigint;
    iteration?:  number;
    account_id?: string;
    valid?:      boolean;
    expires?:    Date;
}

export class AccountSession {
    id: bigint         | undefined;
    session_id: bigint | undefined;
    iteration?: number | undefined;
    account_id: string | undefined;
    valid?: boolean    | undefined;
    expires?: Date     | undefined;

    constructor(data: IAccountSession) {
        this.id         = data.id;
        this.session_id = data.session_id;
        this.iteration  = data.iteration;
        this.account_id = data.account_id;
        this.valid      = data.valid;
        this.expires    = data.expires;
    }
}