export declare class ShipmentService {
    getAll(): Promise<{
        id: number;
        order_id: number;
        courier_name: string | null;
        tracking_number: string | null;
        shipping_status: string | null;
        shipped_at: Date | null;
        delivered_at: Date | null;
        created_at: Date;
    }[]>;
    getById(id: number): Promise<{
        id: number;
        order_id: number;
        courier_name: string | null;
        tracking_number: string | null;
        shipping_status: string | null;
        shipped_at: Date | null;
        delivered_at: Date | null;
        created_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        order_id: number;
        courier_name: string | null;
        tracking_number: string | null;
        shipping_status: string | null;
        shipped_at: Date | null;
        delivered_at: Date | null;
        created_at: Date;
    }>;
}
//# sourceMappingURL=shipment.service.d.ts.map