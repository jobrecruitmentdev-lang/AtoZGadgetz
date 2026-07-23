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
    requestActivationMagicLink(email: string, ip: string, userAgent: string): Promise<void>;
    verifyActivationMagicLink(token: string): Promise<{
        activation_token: string;
        email: string;
    }>;
    completeRegistrationFromActivation(data: {
        activation_token: string;
        first_name: string;
        last_name: string;
        mobile: string;
        password: string;
    }): Promise<{
        id: number;
        email: string;
    }>;
    completeUserProfile(userId: number, data: {
        first_name: string;
        last_name: string;
        mobile: string;
    }): Promise<any>;
    forgotPassword(email: string, ip: string, userAgent: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    sendMobileOtp(mobile: string, purpose: string, ip: string, userAgent: string): Promise<void>;
    verifyMobileOtp(mobile: string, otp: string, purpose: string): Promise<{
        verified: boolean;
        userExists: boolean;
        access_token?: undefined;
        token_type?: undefined;
    } | {
        verified: boolean;
        userExists: boolean;
        access_token: string;
        token_type: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map