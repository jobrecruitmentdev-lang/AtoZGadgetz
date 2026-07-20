export declare class CjCategoryService {
    private static readonly API_BASE_URL;
    /**
     * Fetch CJ's category tree and upsert it into cj_categories.
     * CJ's response shape nests first/second/third-level lists; flatten defensively
     * since the exact key names have drifted across CJ API versions.
     */
    static syncCategories(): Promise<{
        synced: number;
    }>;
    static getCachedCategories(): Promise<{
        id: number;
        cj_category_id: string;
        parent_cj_category_id: string | null;
        name: string;
        level: number;
        synced_at: Date;
    }[]>;
}
//# sourceMappingURL=cj-category.service.d.ts.map