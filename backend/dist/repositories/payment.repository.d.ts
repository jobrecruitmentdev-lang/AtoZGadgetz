export declare class PaymentRepository {
    findAll(): Promise<{
        id: number;
        order_id: number;
        payment_method: string;
        transaction_id: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_status: string | null;
        gateway_response: string | null;
        created_at: Date;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        order_id: number;
        payment_method: string;
        transaction_id: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_status: string | null;
        gateway_response: string | null;
        created_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        order_id: number;
        payment_method: string;
        transaction_id: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_status: string | null;
        gateway_response: string | null;
        created_at: Date;
    }>;
}
//# sourceMappingURL=payment.repository.d.ts.map