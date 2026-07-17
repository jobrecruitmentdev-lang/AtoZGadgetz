export declare class WishlistService {
    getOrCreateWishlist(userId: number): Promise<({
        items: ({
            product: {
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
            };
        } & {
            id: number;
            wishlist_id: number;
            product_id: number;
            created_at: Date;
        })[];
    } & {
        id: number;
        user_id: number;
        created_at: Date;
    }) | null>;
    addItem(userId: number, productId: number): Promise<({
        items: ({
            product: {
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
            };
        } & {
            id: number;
            wishlist_id: number;
            product_id: number;
            created_at: Date;
        })[];
    } & {
        id: number;
        user_id: number;
        created_at: Date;
    }) | null>;
    removeItem(userId: number, productId: number): Promise<({
        items: ({
            product: {
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
            };
        } & {
            id: number;
            wishlist_id: number;
            product_id: number;
            created_at: Date;
        })[];
    } & {
        id: number;
        user_id: number;
        created_at: Date;
    }) | null>;
}
//# sourceMappingURL=wishlist.service.d.ts.map