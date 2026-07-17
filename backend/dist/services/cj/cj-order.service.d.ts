export declare class CjOrderService {
    private static readonly API_BASE_URL;
    static placeOrder(orderId: number): Promise<{
        cjOrderId: string;
    }>;
    private static submitOrder;
    static cancelOrder(cjOrderId: string): Promise<boolean>;
    static getOrderDetail(cjOrderId: string): Promise<any>;
}
//# sourceMappingURL=cj-order.service.d.ts.map