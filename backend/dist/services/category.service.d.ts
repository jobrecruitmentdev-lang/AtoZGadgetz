import { Prisma } from "@prisma/client";
export declare class CategoryService {
    getAllCategories(): Promise<({
        subcategories: {
            id: number;
            category_id: number;
            name: string;
            slug: string;
            description: string | null;
            status: string | null;
            created_at: Date;
            updated_at: Date;
        }[];
    } & {
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
    })[]>;
    createCategory(data: Prisma.CategoryUncheckedCreateInput): Promise<{
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
    }>;
    updateCategory(id: number, data: Prisma.CategoryUncheckedUpdateInput): Promise<{
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
    }>;
    deleteCategory(id: number): Promise<{
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
    }>;
}
//# sourceMappingURL=category.service.d.ts.map