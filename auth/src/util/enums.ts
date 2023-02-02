// ==== Database ==== //
export enum SessionTable {
    ACCOUNT = 'account',
    USER = 'user',
}

export enum OrgRole {
    OWNER = 'OWNER',
    MEMBER = 'MEMBER',
}

export enum DbError {
    DUP_ENTRY = 'ER_DUP_ENTRY',
}