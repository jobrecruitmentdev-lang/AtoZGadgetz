import { Prisma } from "@prisma/client";
export declare class BrandRepository {
    findAll(): Promise<{
        id: number;
        name: string;
        slug: string;
        logo: string | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }[]>;
    create(data: Prisma.BrandUncheckedCreateInput): Promise<{
        id: number;
        name: string;
        slug: string;
        logo: string | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    update(id: number, data: Prisma.BrandUncheckedUpdateInput): Promise<{
        id: number;
        name: string;
        slug: string;
        logo: string | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    delete(id: number): Promise<{
        id: number;
        name: string;
        slug: string;
        logo: string | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=brand.repository.d.ts.map