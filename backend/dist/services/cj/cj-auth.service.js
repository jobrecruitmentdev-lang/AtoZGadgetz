import { cjHttp } from './cj-http.js';
let cjAccessToken = null;
let cjTokenExpiry = 0;
export class CjAuthService {
    static API_BASE_URL = process.env.CJ_API_BASE_URL || 'https://developers.cjdropshipping.com/api2.0/v1';
    static API_EMAIL = process.env.CJ_API_EMAIL;
    static API_KEY = process.env.CJ_API_KEY;
    static async getAccessToken() {
        if (cjAccessToken && Date.now() < cjTokenExpiry) {
            return cjAccessToken;
        }
        if (!this.API_EMAIL || !this.API_KEY) {
            console.warn('⚠️ CJ API Credentials missing in .env. Using CJ Sandbox Mode.');
            return 'SANDBOX_DEMO_TOKEN';
        }
        try {
            const response = await cjHttp.post(`${this.API_BASE_URL}/authentication/getAccessToken`, {
                email: this.API_EMAIL,
                password: this.API_KEY,
            });
            if (response.data.code === 200 && response.data.data) {
                cjAccessToken = response.data.data.accessToken;
                const expiresInMs = (new Date(response.data.data.tokenExpiryDate).getTime() || (Date.now() + 86400 * 1000));
                cjTokenExpiry = expiresInMs - 300000;
                return cjAccessToken;
            }
            else {
                console.warn('⚠️ CJ Auth Response Code != 200. Falling back to sandbox mode:', response.data?.message);
                return 'SANDBOX_DEMO_TOKEN';
            }
        }
        catch (error) {
            console.warn('⚠️ CJ Auth Request Error:', error.response?.data || error.message);
            return 'SANDBOX_DEMO_TOKEN';
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
//# sourceMappingURL=cj-auth.service.js.map