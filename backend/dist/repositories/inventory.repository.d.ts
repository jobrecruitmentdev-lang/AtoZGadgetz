import { Prisma } from "@prisma/client";
export declare class InventoryRepository {
    findAll(): Promise<{
        id: number;
        product_id: number;
        variant_id: number | null;
        stock_quantity: number;
        reserved_quantity: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    findById(id: number): Promise<{
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
    update(id: number, data: Prisma.InventoryUncheckedUpdateInput): Promise<{
        id: number;
        product_id: number;
        variant_id: number | null;
        stock_quantity: number;
        reserved_quantity: number;
        created_at: Date;
        updated_at: Date;
    }>;
    delete(id: number): Promise<{
        id: number;
        product_id: number;
        variant_id: number | null;
        stock_quantity: number;
        reserved_quantity: number;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=inventory.repository.d.ts.map