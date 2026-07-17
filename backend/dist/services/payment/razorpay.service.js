import axios from 'axios';
import crypto from 'crypto';
export class RazorpayService {
    static KEY_ID = process.env.RAZORPAY_KEY_ID || '';
    static KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
    static BASE_URL = 'https://api.razorpay.com/v1';
    static get authHeader() {
        const credentials = Buffer.from(`${this.KEY_ID}:${this.KEY_SECRET}`).toString('base64');
        return {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
        };
    }
    static async createOrder(amount, currency, receipt) {
        // Razorpay accepts amount in smallest currency unit (paise for INR, cents for USD)
        const amountInSmallest = Math.round(amount * 100);
        const response = await axios.post(`${this.BASE_URL}/orders`, { amount: amountInSmallest, currency, receipt }, { headers: this.authHeader });
        return response.data;
    }
    static verifySignature(razorpayOrderId, razorpayPaymentId, signature) {
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', this.KEY_SECRET)
            .update(body)
            .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(signature, 'hex'));
    }
    static getKeyId() {
        return this.KEY_ID;
    }
}
//# sourceMappingURL=razorpay.service.js.map