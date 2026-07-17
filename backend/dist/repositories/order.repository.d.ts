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
    placeOrder(userId: number, addressId: number, couponId: number | null): Promise<{
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