import { Prisma } from "@prisma/client";
export declare class HomepageSectionService {
    getAll(): Promise<{
        id: number;
        title: string;
        section_type: string;
        sort_order: number | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }[]>;
    getById(id: number): Promise<{
        id: number;
        title: string;
        section_type: string;
        sort_order: number | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        title: string;
        section_type: string;
        sort_order: number | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    updateHomepageSection(id: number, data: Prisma.HomepageSectionUncheckedUpdateInput): Promise<{
        id: number;
        title: string;
        section_type: string;
        sort_order: number | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    deleteHomepageSection(id: number): Promise<{
        id: number;
        title: string;
        section_type: string;
        sort_order: number | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=homepage_section.service.d.ts.map