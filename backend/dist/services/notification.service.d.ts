export declare class NotificationService {
    getAllForUser(userId: number): Promise<{
        id: number;
        user_id: number;
        title: string;
        message: string;
        type: string;
        is_read: boolean;
        created_at: Date;
    }[]>;
    getById(id: number): Promise<{
        id: number;
        user_id: number;
        title: string;
        message: string;
        type: string;
        is_read: boolean;
        created_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        user_id: number;
        title: string;
        message: string;
        type: string;
        is_read: boolean;
        created_at: Date;
    }>;
}
//# sourceMappingURL=notification.service.d.ts.map