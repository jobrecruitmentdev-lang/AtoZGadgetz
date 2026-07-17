export declare class CjAuthService {
    private static readonly API_BASE_URL;
    private static readonly API_EMAIL;
    private static readonly API_KEY;
    static getAccessToken(): Promise<string>;
    static getAuthHeaders(): Promise<{
        'Content-Type': string;
        'CJ-Access-Token': string;
    }>;
}
//# sourceMappingURL=cj-auth.service.d.ts.map