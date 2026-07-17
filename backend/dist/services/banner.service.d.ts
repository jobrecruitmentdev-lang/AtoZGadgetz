import { Prisma } from "@prisma/client";
export declare class BannerService {
    getAll(): Promise<{
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
    getById(id: number): Promise<{
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
    updateBanner(id: number, data: Prisma.BannerUncheckedUpdateInput): Promise<{
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
    deleteBanner(id: number): Promise<{
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
//# sourceMappingURL=banner.service.d.ts.map