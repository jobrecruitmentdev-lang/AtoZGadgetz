export declare class RazorpayService {
    private static readonly KEY_ID;
    private static readonly KEY_SECRET;
    private static readonly BASE_URL;
    private static get authHeader();
    static createOrder(amount: number, currency: 'INR' | 'USD', receipt: string): Promise<any>;
    static verifySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean;
    static getKeyId(): string;
}
//# sourceMappingURL=razorpay.service.d.ts.map