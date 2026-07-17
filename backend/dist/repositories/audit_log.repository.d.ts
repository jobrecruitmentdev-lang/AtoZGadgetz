export declare class AuditLogRepository {
    findAll(): Promise<{
        id: number;
        user_id: number | null;
        module: string;
        action: string;
        description: string;
        old_data: string | null;
        new_data: string | null;
        ip_address: string | null;
        user_agent: string | null;
        created_at: Date;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        user_id: number | null;
        module: string;
        action: string;
        description: string;
        old_data: string | null;
        new_data: string | null;
        ip_address: string | null;
        user_agent: string | null;
        created_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        user_id: number | null;
        module: string;
        action: string;
        description: string;
        old_data: string | null;
        new_data: string | null;
        ip_address: string | null;
        user_agent: string | null;
        created_at: Date;
    }>;
}
//# sourceMappingURL=audit_log.repository.d.ts.map