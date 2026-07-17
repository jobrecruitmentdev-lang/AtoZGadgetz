import { Prisma } from "@prisma/client";
export declare class HomepageSectionRepository {
    findAll(): Promise<{
        id: number;
        title: string;
        section_type: string;
        sort_order: number | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }[]>;
    findById(id: number): Promise<{
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
    update(id: number, data: Prisma.HomepageSectionUncheckedUpdateInput): Promise<{
        id: number;
        title: string;
        section_type: string;
        sort_order: number | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    delete(id: number): Promise<{
        id: number;
        title: string;
        section_type: string;
        sort_order: number | null;
        status: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=homepage_section.repository.d.ts.map