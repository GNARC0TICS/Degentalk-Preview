export interface User {
	id: string;
	role: string;
	email?: string;
	permissions?: string[] | undefined;
}
