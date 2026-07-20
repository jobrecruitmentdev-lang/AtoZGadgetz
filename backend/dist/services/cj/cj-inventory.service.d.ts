export declare class CjInventoryService {
    /**
     * Re-fetch a single imported product's CJ detail and refresh local stock.
     * Variants are matched back by name+value since no CJ variant id is stored
     * at import time — this is a best-effort match, not a guaranteed key.
     */
    static syncProductInventory(productId: number): Promise<{
        productId: number;
        stock_quantity: number;
    }>;
    static syncAllInventory(): Promise<{
        succeeded: number;
        failed: number;
    }>;
}
//# sourceMappingURL=cj-inventory.service.d.ts.map