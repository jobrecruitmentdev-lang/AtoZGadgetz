export declare class OrderRepository {
    findAll(): Promise<{
        id: number;
        order_number: string;
        user_id: number;
        address_id: number;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discount_amount: import("@prisma/client/runtime/library").Decimal;
        tax_amount: import("@prisma/client/runtime/library").Decimal;
        shipping_charge: import("@prisma/client/runtime/library").Decimal;
        total_amount: import("@prisma/client/runtime/library").Decimal;
        coupon_id: number | null;
        offer_discount: import("@prisma/client/runtime/library").Decimal;
        payment_status: string | null;
        order_status: string | null;
        created_at: Date;
        updated_at: Date;
    }[]>;
    findMyOrders(userId: number): Promise<({
        items: {
            id: number;
            order_id: number;
            product_id: number;
            variant_id: number | null;
            product_name: string;
            product_image: string | null;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            created_at: Date;
        }[];
    } & {
        id: number;
        order_number: string;
        user_id: number;
        address_id: number;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discount_amount: import("@prisma/client/runtime/library").Decimal;
        tax_amount: import("@prisma/client/runtime/library").Decimal;
        shipping_charge: import("@prisma/client/runtime/library").Decimal;
        total_amount: import("@prisma/client/runtime/library").Decimal;
        coupon_id: number | null;
        offer_discount: import("@prisma/client/runtime/library").Decimal;
        payment_status: string | null;
        order_status: string | null;
        created_at: Date;
        updated_at: Date;
    })[]>;
    findById(id: number): Promise<({
        cj_order: {
            id: string;
            cj_order_id: string;
            cj_status: string;
            placed_at: Date;
            order_id: number;
        } | null;
        items: ({
            product: {
                cj_product: {
                    id: string;
                    cj_pid: string;
                    cj_vid: string | null;
                    supplier_price: import("@prisma/client/runtime/library").Decimal;
                    last_synced_at: Date;
                    product_id: number | null;
                } | null;
            } & {
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
            variant: {
                id: number;
                product_id: number;
                variant_name: string;
                variant_value: string;
                additional_price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
                created_at: Date;
            } | null;
        } & {
            id: number;
            order_id: number;
            product_id: number;
            variant_id: number | null;
            product_name: string;
            product_image: string | null;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            created_at: Date;
        })[];
        shipment: ({
            cj_shipment: {
                id: string;
                cj_tracking_id: string | null;
                carrier_name: string | null;
                tracking_url: string | null;
                cj_status: string | null;
                shipment_id: number;
            } | null;
        } & {
            id: number;
            order_id: number;
            courier_name: string | null;
            tracking_number: string | null;
            shipping_status: string | null;
            shipped_at: Date | null;
            delivered_at: Date | null;
            created_at: Date;
        }) | null;
        status_history: {
            id: number;
            order_id: number;
            old_status: string | null;
            new_status: string;
            changed_by: number | null;
            created_at: Date;
        }[];
    } & {
        id: number;
        order_number: string;
        user_id: number;
        address_id: number;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discount_amount: import("@prisma/client/runtime/library").Decimal;
        tax_amount: import("@prisma/client/runtime/library").Decimal;
        shipping_charge: import("@prisma/client/runtime/library").Decimal;
        total_amount: import("@prisma/client/runtime/library").Decimal;
        coupon_id: number | null;
        offer_discount: import("@prisma/client/runtime/library").Decimal;
        payment_status: string | null;
        order_status: string | null;
        created_at: Date;
        updated_at: Date;
    }) | null>;
    findInvoiceById(id: number): Promise<({
        address: {
            id: number;
            user_id: number;
            address_line1: string;
            address_line2: string | null;
            city: string;
            state: string;
            postal_code: string;
            country: string;
            is_default: boolean | null;
            created_at: Date;
            updated_at: Date;
        };
        items: {
            id: number;
            order_id: number;
            product_id: number;
            variant_id: number | null;
            product_name: string;
            product_image: string | null;
            quantity: number;
            price: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            created_at: Date;
        }[];
        payment: {
            id: number;
            order_id: number;
            payment_method: string;
            transaction_id: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_status: string | null;
            gateway_response: string | null;
            created_at: Date;
        } | null;
        user: {
            id: number;
            role_id: number;
            first_name: string;
            last_name: string | null;
            email: string;
            mobile: string;
            password_hash: string;
            profile_image: string | null;
            is_active: boolean | null;
            created_at: Date;
            updated_at: Date | null;
        };
    } & {
        id: number;
        order_number: string;
        user_id: number;
        address_id: number;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discount_amount: import("@prisma/client/runtime/library").Decimal;
        tax_amount: import("@prisma/client/runtime/library").Decimal;
        shipping_charge: import("@prisma/client/runtime/library").Decimal;
        total_amount: import("@prisma/client/runtime/library").Decimal;
        coupon_id: number | null;
        offer_discount: import("@prisma/client/runtime/library").Decimal;
        payment_status: string | null;
        order_status: string | null;
        created_at: Date;
        updated_at: Date;
    }) | null>;
    create(data: any): Promise<{
        id: number;
        order_number: string;
        user_id: number;
        address_id: number;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discount_amount: import("@prisma/client/runtime/library").Decimal;
        tax_amount: import("@prisma/client/runtime/library").Decimal;
        shipping_charge: import("@prisma/client/runtime/library").Decimal;
        total_amount: import("@prisma/client/runtime/library").Decimal;
        coupon_id: number | null;
        offer_discount: import("@prisma/client/runtime/library").Decimal;
        payment_status: string | null;
        order_status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    placeOrder(userId: number | undefined, payload: any): Promise<{
        id: number;
        order_number: string;
        user_id: number;
        address_id: number;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discount_amount: import("@prisma/client/runtime/library").Decimal;
        tax_amount: import("@prisma/client/runtime/library").Decimal;
        shipping_charge: import("@prisma/client/runtime/library").Decimal;
        total_amount: import("@prisma/client/runtime/library").Decimal;
        coupon_id: number | null;
        offer_discount: import("@prisma/client/runtime/library").Decimal;
        payment_status: string | null;
        order_status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    updateStatus(id: number, status: string, changedBy: number): Promise<{
        id: number;
        order_number: string;
        user_id: number;
        address_id: number;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discount_amount: import("@prisma/client/runtime/library").Decimal;
        tax_amount: import("@prisma/client/runtime/library").Decimal;
        shipping_charge: import("@prisma/client/runtime/library").Decimal;
        total_amount: import("@prisma/client/runtime/library").Decimal;
        coupon_id: number | null;
        offer_discount: import("@prisma/client/runtime/library").Decimal;
        payment_status: string | null;
        order_status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=order.repository.d.ts.map