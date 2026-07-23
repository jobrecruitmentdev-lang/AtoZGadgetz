export declare class PayPalService {
    private static readonly MODE;
    private static readonly CLIENT_ID;
    private static readonly CLIENT_SECRET;
    private static get baseUrl();
    /**
     * Get OAuth2 Access Token from PayPal REST API
     */
    static getAccessToken(): Promise<string>;
    /**
     * Create a PayPal Checkout Order (v2/checkout/orders)
     */
    static createOrder(amount: number, currency: string | undefined, orderId: string | number, returnUrl?: string, cancelUrl?: string, requestId?: string): Promise<any>;
    /**
     * Capture Payment for a PayPal Checkout Order (v2/checkout/orders/{id}/capture)
     */
    static captureOrder(paypalOrderId: string, requestId: string): Promise<any>;
    static getClientId(): string;
}
//# sourceMappingURL=paypal.service.d.ts.map