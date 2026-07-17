export declare class UserSessionService {
    getAllForUser(userId: number): Promise<{
        id: number;
        user_id: number;
        device_name: string | null;
        ip_address: string | null;
        user_agent: string | null;
        refresh_token: string | null;
        expires_at: Date;
        is_active: boolean;
        created_at: Date;
    }[]>;
    getById(id: number): Promise<{
        id: number;
        user_id: number;
        device_name: string | null;
        ip_address: string | null;
        user_agent: string | null;
        refresh_token: string | null;
        expires_at: Date;
        is_active: boolean;
        created_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        user_id: number;
        device_name: string | null;
        ip_address: string | null;
        user_agent: string | null;
        refresh_token: string | null;
        expires_at: Date;
        is_active: boolean;
        created_at: Date;
    }>;
}
//# sourceMappingURL=user_session.service.d.ts.map