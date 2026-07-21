export declare class CjSyncService {
    /**
     * Syncs products for all categories that have a cj_keyword defined.
     * This should be called by the background worker.
     */
    static syncAllCategories(pagesPerCategory?: number): Promise<void>;
    /**
     * Upserts a raw CJ product item into the local database as a Product.
     */
    static upsertCJProduct(item: any, categoryId: number, subcategoryId: number): Promise<void>;
}
//# sourceMappingURL=cj-sync.service.d.ts.map