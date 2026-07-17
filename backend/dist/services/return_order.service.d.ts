export declare class ReturnOrderService {
    getAll(): Promise<{
        id: number;
        order_id: number;
        user_id: number;
        reason: string;
        status: string | null;
        created_at: Date;
    }[]>;
    getById(id: number): Promise<{
        id: number;
        order_id: number;
        user_id: number;
        reason: string;
        status: string | null;
        created_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        order_id: number;
        user_id: number;
        reason: string;
        status: string | null;
        created_at: Date;
    }>;
}
//# sourceMappingURL=return_order.service.d.ts.map