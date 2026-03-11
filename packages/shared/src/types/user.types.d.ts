export interface User {
    _id: string;
    email: string;
    name: string;
    workspaces: string[];
    overallScore: number;
    createdAt: Date;
}
export interface CreateUserDto {
    email: string;
    name: string;
    password: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    accessToken: string;
    user: Omit<User, '_id'> & {
        id: string;
    };
}
//# sourceMappingURL=user.types.d.ts.map