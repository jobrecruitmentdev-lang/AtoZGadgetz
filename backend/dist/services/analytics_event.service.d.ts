export declare class AnalyticsEventService {
    getAll(): Promise<{
        id: number;
        user_id: number | null;
        session_id: string | null;
        event_name: string;
        event_data: string | null;
        ip_address: string | null;
        user_agent: string | null;
        page_url: string | null;
        referrer: string | null;
        created_at: Date;
    }[]>;
    getById(id: number): Promise<{
        id: number;
        user_id: number | null;
        session_id: string | null;
        event_name: string;
        event_data: string | null;
        ip_address: string | null;
        user_agent: string | null;
        page_url: string | null;
        referrer: string | null;
        created_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        user_id: number | null;
        session_id: string | null;
        event_name: string;
        event_data: string | null;
        ip_address: string | null;
        user_agent: string | null;
        page_url: string | null;
        referrer: string | null;
        created_at: Date;
    }>;
}
//# sourceMappingURL=analytics_event.service.d.ts.map