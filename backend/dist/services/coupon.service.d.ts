import { Prisma } from "@prisma/client";
export declare class CouponService {
    getAll(): Promise<{
        id: number;
        code: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        minimum_order_amount: Prisma.Decimal;
        maximum_discount: Prisma.Decimal | null;
        start_date: Date;
        end_date: Date;
        usage_limit: number | null;
        status: string | null;
        created_at: Date;
    }[]>;
    getById(id: number): Promise<{
        id: number;
        code: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        minimum_order_amount: Prisma.Decimal;
        maximum_discount: Prisma.Decimal | null;
        start_date: Date;
        end_date: Date;
        usage_limit: number | null;
        status: string | null;
        created_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        code: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        minimum_order_amount: Prisma.Decimal;
        maximum_discount: Prisma.Decimal | null;
        start_date: Date;
        end_date: Date;
        usage_limit: number | null;
        status: string | null;
        created_at: Date;
    }>;
    updateCoupon(id: number, data: Prisma.CouponUncheckedUpdateInput): Promise<{
        id: number;
        code: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        minimum_order_amount: Prisma.Decimal;
        maximum_discount: Prisma.Decimal | null;
        start_date: Date;
        end_date: Date;
        usage_limit: number | null;
        status: string | null;
        created_at: Date;
    }>;
    deleteCoupon(id: number): Promise<{
        id: number;
        code: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        minimum_order_amount: Prisma.Decimal;
        maximum_discount: Prisma.Decimal | null;
        start_date: Date;
        end_date: Date;
        usage_limit: number | null;
        status: string | null;
        created_at: Date;
    }>;
}
//# sourceMappingURL=coupon.service.d.ts.map