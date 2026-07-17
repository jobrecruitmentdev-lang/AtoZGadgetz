export declare class CjShipmentService {
    private static readonly API_BASE_URL;
    static syncShipment(orderId: number): Promise<{
        id: string;
        cj_tracking_id: string | null;
        carrier_name: string | null;
        tracking_url: string | null;
        cj_status: string | null;
        shipment_id: number;
    } | null>;
    static syncAllActiveShipments(): Promise<PromiseSettledResult<{
        id: string;
        cj_tracking_id: string | null;
        carrier_name: string | null;
        tracking_url: string | null;
        cj_status: string | null;
        shipment_id: number;
    } | null>[]>;
    static handleWebhook(payload: any): Promise<void>;
    static getTrackingInfo(orderId: number): Promise<({
        cj_shipment: {
            id: string;
            cj_tracking_id: string | null;
            carrier_name: string | null;
            tracking_url: string | null;
            cj_status: string | null;
            shipment_id: number;
        } | null;
    } & {
        id: number;
        order_id: number;
        courier_name: string | null;
        tracking_number: string | null;
        shipping_status: string | null;
        shipped_at: Date | null;
        delivered_at: Date | null;
        created_at: Date;
    }) | null>;
}
//# sourceMappingURL=cj-shipment.service.d.ts.map