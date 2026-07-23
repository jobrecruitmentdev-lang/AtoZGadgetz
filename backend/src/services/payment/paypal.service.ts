import axios from 'axios';

let paypalAccessToken: string | null = null;
let paypalTokenExpiry: number = 0;

export class PayPalService {
  private static readonly MODE = process.env.PAYPAL_MODE || 'sandbox';
  private static readonly CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
  private static readonly CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

  private static get baseUrl(): string {
    return this.MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  /**
   * Get OAuth2 Access Token from PayPal REST API
   */
  static async getAccessToken(): Promise<string> {
    if (paypalAccessToken && Date.now() < paypalTokenExpiry) {
      return paypalAccessToken;
    }

    if (!this.CLIENT_ID || !this.CLIENT_SECRET || this.CLIENT_ID.includes('test_paypal_client_id') || this.CLIENT_SECRET.includes('test_paypal')) {
      return 'DEMO_PAYPAL_TOKEN';
    }

    const auth = Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64');
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      paypalAccessToken = response.data.access_token;
      // Expire 60s before actual token expiration
      paypalTokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
      return paypalAccessToken as string;
    } catch (error: any) {
      console.error('PayPal OAuth Token Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with PayPal API');
    }
  }

  /**
   * Create a PayPal Checkout Order (v2/checkout/orders)
   */
  static async createOrder(
    amount: number,
    currency: string = 'USD',
    orderId: string | number,
    returnUrl: string = 'http://localhost:3000/order-success',
    cancelUrl: string = 'http://localhost:3000/checkout',
    requestId: string = `PAYPAL-REQ-${Date.now()}`,
  ) {
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
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        {
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
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': requestId,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('PayPal Create Order Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create PayPal order');
    }
  }

  /**
   * Capture Payment for a PayPal Checkout Order (v2/checkout/orders/{id}/capture)
   */
  static async captureOrder(paypalOrderId: string, requestId: string) {
    const token = await this.getAccessToken();
    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': requestId,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('PayPal Capture Order Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to capture PayPal payment');
    }
  }

  static getClientId(): string {
    return this.CLIENT_ID;
  }
}
