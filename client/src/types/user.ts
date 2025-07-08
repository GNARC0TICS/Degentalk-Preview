export interface User {
	id: string;
	role: string;
	email?: string | undefined;
	permissions?: string[] | undefined;
}
