export declare class AuthService {
    registerUser(data: {
        first_name: string;
        last_name?: string;
        email: string;
        mobile: string;
        password: string;
        role_id?: number;
    }): Promise<{
        id: number;
        role_id: number;
        first_name: string;
        last_name: string | null;
        email: string;
        mobile: string;
        password_hash: string;
        profile_image: string | null;
        is_active: boolean | null;
        created_at: Date;
        updated_at: Date | null;
    }>;
    loginUser(email: string, password_plain: string): Promise<string>;
    forgotPassword(email: string, ip: string, userAgent: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map