import { Prisma } from "@prisma/client";
export declare class BannerRepository {
    findAll(): Promise<{
        id: number;
        title: string;
        image: string;
        mobile_image: string | null;
        redirect_url: string | null;
        position: string;
        sort_order: number | null;
        status: string | null;
        start_date: Date;
        end_date: Date;
        created_at: Date;
        updated_at: Date;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        title: string;
        image: string;
        mobile_image: string | null;
        redirect_url: string | null;
        position: string;
        sort_order: number | null;
        status: string | null;
        start_date: Date;
        end_date: Date;
        created_at: Date;
        updated_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        title: string;
        image: string;
        mobile_image: string | null;
        redirect_url: string | null;
        position: string;
        sort_order: number | null;
        status: string | null;
        start_date: Date;
        end_date: Date;
        created_at: Date;
        updated_at: Date;
    }>;
    update(id: number, data: Prisma.BannerUncheckedUpdateInput): Promise<{
        id: number;
        title: string;
        image: string;
        mobile_image: string | null;
        redirect_url: string | null;
        position: string;
        sort_order: number | null;
        status: string | null;
        start_date: Date;
        end_date: Date;
        created_at: Date;
        updated_at: Date;
    }>;
    delete(id: number): Promise<{
        id: number;
        title: string;
        image: string;
        mobile_image: string | null;
        redirect_url: string | null;
        position: string;
        sort_order: number | null;
        status: string | null;
        start_date: Date;
        end_date: Date;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=banner.repository.d.ts.map