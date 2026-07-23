import axios from 'axios';
let paypalAccessToken = null;
let paypalTokenExpiry = 0;
export class PayPalService {
    static MODE = process.env.PAYPAL_MODE || 'sandbox';
    static CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
    static CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
    static get baseUrl() {
        return this.MODE === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }
    /**
     * Get OAuth2 Access Token from PayPal REST API
     */
    static async getAccessToken() {
        if (paypalAccessToken && Date.now() < paypalTokenExpiry) {
            return paypalAccessToken;
        }
        if (!this.CLIENT_ID || !this.CLIENT_SECRET || this.CLIENT_ID.includes('test_paypal_client_id') || this.CLIENT_SECRET.includes('test_paypal')) {
            return 'DEMO_PAYPAL_TOKEN';
        }
        const auth = Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64');
        try {
            const response = await axios.post(`${this.baseUrl}/v1/oauth2/token`, 'grant_type=client_credentials', {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            paypalAccessToken = response.data.access_token;
            // Expire 60s before actual token expiration
            paypalTokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
            return paypalAccessToken;
        }
        catch (error) {
            console.error('PayPal OAuth Token Error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with PayPal API');
        }
    }
    /**
     * Create a PayPal Checkout Order (v2/checkout/orders)
     */
    static async createOrder(amount, currency = 'USD', orderId, returnUrl = 'http://localhost:3000/order-success', cancelUrl = 'http://localhost:3000/checkout', requestId = `PAYPAL-REQ-${Date.now()}`) {
        const token = await this.getAccessToken();
        if (token === 'DEMO_PAYPAL_TOKEN') {
            return {
                id: `PAYPAL-DEMO-ORDER-${Date.now()}`,
                status: 'CREATED',
                links: [{ href: returnUrl, rel: 'approve', method: 'GET' }]
            };
        }
        const formattedAmount = Number(amount).toFixed(2);
        try {
            const response = await axios.post(`${this.baseUrl}/v2/checkout/orders`, {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        reference_id: String(orderId),
                        amount: {
                            currency_code: currency,
                            value: formattedAmount,
                        },
                        description: `AtoZGadgets Order #${orderId}`,
                    },
                ],
                application_context: {
                    brand_name: 'AtoZGadgetz',
                    landing_page: 'NO_PREFERENCE',
                    user_action: 'PAY_NOW',
                    return_url: returnUrl,
                    cancel_url: cancelUrl,
                },
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': requestId,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('PayPal Create Order Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create PayPal order');
        }
    }
    /**
     * Capture Payment for a PayPal Checkout Order (v2/checkout/orders/{id}/capture)
     */
    static async captureOrder(paypalOrderId, requestId) {
        const token = await this.getAccessToken();
        try {
            const response = await axios.post(`${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': requestId,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('PayPal Capture Order Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to capture PayPal payment');
        }
    }
    static getClientId() {
        return this.CLIENT_ID;
    }
}
//# sourceMappingURL=paypal.service.js.map