import { Prisma } from "@prisma/client";
export declare class OfferRepository {
    findAll(): Promise<{
        id: number;
        name: string;
        description: string | null;
        offer_type: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        minimum_order_amount: Prisma.Decimal;
        maximum_discount: Prisma.Decimal | null;
        start_date: Date;
        end_date: Date;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
        offer_type: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        minimum_order_amount: Prisma.Decimal;
        maximum_discount: Prisma.Decimal | null;
        start_date: Date;
        end_date: Date;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        name: string;
        description: string | null;
        offer_type: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        minimum_order_amount: Prisma.Decimal;
        maximum_discount: Prisma.Decimal | null;
        start_date: Date;
        end_date: Date;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    update(id: number, data: Prisma.OfferUncheckedUpdateInput): Promise<{
        id: number;
        name: string;
        description: string | null;
        offer_type: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        minimum_order_amount: Prisma.Decimal;
        maximum_discount: Prisma.Decimal | null;
        start_date: Date;
        end_date: Date;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    delete(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
        offer_type: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        minimum_order_amount: Prisma.Decimal;
        maximum_discount: Prisma.Decimal | null;
        start_date: Date;
        end_date: Date;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=offer.repository.d.ts.map