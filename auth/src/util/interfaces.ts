export interface KeystoreRepo {
	find(type: 'private' | 'public', project_id?: string): Promise<Buffer | null>;
}
