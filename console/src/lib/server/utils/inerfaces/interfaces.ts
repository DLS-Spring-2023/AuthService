export interface ConsoleUser {
    id?: string;
    name?: string;
    email?: string;
    personalOrgId?: string;
    authenticated: boolean;
    accessToken?: string;
    sessionToken?: string;
}