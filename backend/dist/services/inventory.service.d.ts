import { Prisma } from "@prisma/client";
export declare class InventoryService {
    getAll(): Promise<{
        id: number;
        product_id: number;
        variant_id: number | null;
        stock_quantity: number;
        reserved_quantity: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    getById(id: number): Promise<{
        id: number;
        product_id: number;
        variant_id: number | null;
        stock_quantity: number;
        reserved_quantity: number;
        created_at: Date;
        updated_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        product_id: number;
        variant_id: number | null;
        stock_quantity: number;
        reserved_quantity: number;
        created_at: Date;
        updated_at: Date;
    }>;
    updateInventory(id: number, data: Prisma.InventoryUncheckedUpdateInput): Promise<{
        id: number;
        product_id: number;
        variant_id: number | null;
        stock_quantity: number;
        reserved_quantity: number;
        created_at: Date;
        updated_at: Date;
    }>;
    deleteInventory(id: number): Promise<{
        id: number;
        product_id: number;
        variant_id: number | null;
        stock_quantity: number;
        reserved_quantity: number;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=inventory.service.d.ts.map