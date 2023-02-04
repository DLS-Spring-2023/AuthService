// ===== Entities ===== //
export interface Account {
    id?: string;
    name: string;
    email: string;
    password_hash: string;
    created_at?: Date;
    updated_at?: Date;
    personal_org_id?: string;
}

export interface AccountSession {
    id: bigint;
    session_id: bigint;
    iteration?: number;
    account_id: string;
    valid?: boolean;
    expires?: Date;
}

export interface User {
    id?: string;
    project_id: string;
    name: string;
    email: string;
    password_hash: string;
    created_at?: Date;
    updated_at?: Date;
    personal_org_id?: string;
}

export interface UserSession {
    id: bigint;
    session: bigint;
    iteration?: number;
    account_id: string;
    valid?: boolean;
    expires?: Date;
}

export interface Organization {
    id?: string;
    name: string;
    created_at?: Date;
    updated_at?: Date;
}

// ===== Server Settings ==== //
export interface Settings {
    allow_multiple_accounts: boolean;
}

