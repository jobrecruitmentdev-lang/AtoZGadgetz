import { Prisma } from "@prisma/client";
export declare class BrandService {
    getAllBrands(): Promise<{
        id: number;
        name: string;
        slug: string;
        logo: string | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }[]>;
    createBrand(data: Prisma.BrandUncheckedCreateInput): Promise<{
        id: number;
        name: string;
        slug: string;
        logo: string | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    updateBrand(id: number, data: Prisma.BrandUncheckedUpdateInput): Promise<{
        id: number;
        name: string;
        slug: string;
        logo: string | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    deleteBrand(id: number): Promise<{
        id: number;
        name: string;
        slug: string;
        logo: string | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=brand.service.d.ts.map