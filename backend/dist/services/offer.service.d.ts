import { Prisma } from "@prisma/client";
export declare class OfferService {
    getAll(): Promise<{
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
    getById(id: number): Promise<{
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
    updateOffer(id: number, data: Prisma.OfferUncheckedUpdateInput): Promise<{
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
    deleteOffer(id: number): Promise<{
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
//# sourceMappingURL=offer.service.d.ts.map