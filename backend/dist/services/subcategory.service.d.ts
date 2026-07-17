import { Prisma } from "@prisma/client";
export declare class SubcategoryService {
    getAllSubcategories(): Promise<({
        category: {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            image: string | null;
            status: string | null;
            cj_keyword: string | null;
            seo_title: string | null;
            seo_description: string | null;
            created_at: Date;
            updated_at: Date;
        };
    } & {
        id: number;
        category_id: number;
        name: string;
        slug: string;
        description: string | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    })[]>;
    createSubcategory(data: Prisma.SubCategoryUncheckedCreateInput): Promise<{
        id: number;
        category_id: number;
        name: string;
        slug: string;
        description: string | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=subcategory.service.d.ts.map