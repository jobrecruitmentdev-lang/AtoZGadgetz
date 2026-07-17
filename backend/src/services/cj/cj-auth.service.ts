import { cjHttp } from './cj-http.js';

let cjAccessToken: string | null = null;
let cjTokenExpiry: number = 0;

export class CjAuthService {
  private static readonly API_BASE_URL = process.env.CJ_API_BASE_URL || 'https://developers.cjdropshipping.com/api2.0/v1';
  private static readonly API_EMAIL = process.env.CJ_API_EMAIL;
  private static readonly API_KEY = process.env.CJ_API_KEY;

  static async getAccessToken(): Promise<string> {
    if (cjAccessToken && Date.now() < cjTokenExpiry) {
      return cjAccessToken;
    }

    if (!this.API_EMAIL || !this.API_KEY) {
      throw new Error('CJ Dropshipping credentials not found in environment variables.');
    }

    try {
      const response = await cjHttp.post(`${this.API_BASE_URL}/authentication/getAccessToken`, {
        email: this.API_EMAIL,
        password: this.API_KEY,
      });

      if (response.data.code === 200 && response.data.data) {
        cjAccessToken = response.data.data.accessToken;
        // The token is valid for 24 hours (86400 seconds). We'll set expiry 5 mins early to be safe.
        const expiresInMs = (new Date(response.data.data.tokenExpiryDate).getTime() || (Date.now() + 86400 * 1000));
        cjTokenExpiry = expiresInMs - 300000;
        return cjAccessToken as string;
      } else {
        throw new Error(`Failed to get CJ access token: ${JSON.stringify(response.data)}`);
      }
    } catch (error: any) {
      console.error('CJ Auth Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with CJ Dropshipping.');
    }
  }

  static async getAuthHeaders() {
    const token = await this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      'CJ-Access-Token': token,
    };
  }
}
