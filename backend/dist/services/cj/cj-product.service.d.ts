export declare class CjProductService {
    private static readonly API_BASE_URL;
    private static readonly DETAIL_CACHE_TTL_MS;
    private static detailCache;
    /**
     * Search for products in CJ Dropshipping catalog with resource filters
     */
    static searchProducts(keyword: string, pageNum?: number, pageSize?: number, filters?: {
        minPrice?: number;
        maxPrice?: number;
        categoryId?: string;
        countryCode?: string;
    }): Promise<{
        list: any[];
        total: any;
    }>;
    /**
     * Hunt for high-quality products by verifying image counts.
     * When minImages <= 1 the filter is skipped and the raw search page is returned.
     * For minImages > 1 each candidate on the requested page is fetched via
     * getProductDetail and only products with enough images are kept.
     * A soft deadline prevents the request from hanging longer than ~20s.
     */
    static huntProducts(keyword: string, minImages?: number, pageNum?: number, pageSize?: number, filters?: {
        minPrice?: number;
        maxPrice?: number;
        categoryId?: string;
        countryCode?: string;
    }): Promise<{
        list: any[];
        total: any;
    }>;
    /**
     * Quick health check that proves CJ credentials work and live products return.
     */
    static verifyConnection(): Promise<{
        connected: boolean;
        tokenType: string;
        sampleProductCount: number;
        totalAvailable: any;
        message: string;
    }>;
    /**
     * Count usable images in a CJ product detail payload.
     */
    private static countImagesInDetail;
    /**
     * Get product details by CJ Product ID
     */
    static getProductDetail(cjPid: string): Promise<any>;
    /**
     * Import a product from CJ Dropshipping into our database
     */
    static importProduct(cjPid: string, categoryId: number, subcategoryId: number, markupPercentage?: number): Promise<{
        id: number;
        category_id: number;
        subcategory_id: number;
        brand_id: number | null;
        name: string;
        slug: string;
        short_description: string | null;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        discount_price: import("@prisma/client/runtime/library").Decimal | null;
        tax_percentage: import("@prisma/client/runtime/library").Decimal | null;
        stock_quantity: number;
        weight: number | null;
        length: number | null;
        width: number | null;
        height: number | null;
        thumbnail_image: string | null;
        handle: string | null;
        title: string | null;
        option1_name: string | null;
        option2_name: string | null;
        option3_name: string | null;
        hs_code: string | null;
        country_of_origin: string | null;
        location: string | null;
        bin_name: string | null;
        incoming: number;
        unavailable: number;
        committed: number;
        available: number;
        onhand_old: number;
        onhand_new: number;
        status: string | null;
        is_featured: boolean | null;
        is_active: boolean | null;
        created_by: number;
        fulfillment_type: string;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=cj-product.service.d.ts.map