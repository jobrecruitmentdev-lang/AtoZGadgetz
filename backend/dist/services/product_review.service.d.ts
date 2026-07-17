export declare class ProductReviewService {
    getAll(): Promise<{
        id: number;
        user_id: number;
        product_id: number;
        rating: number;
        review: string | null;
        status: string | null;
        created_at: Date;
    }[]>;
    getById(id: number): Promise<{
        id: number;
        user_id: number;
        product_id: number;
        rating: number;
        review: string | null;
        status: string | null;
        created_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        user_id: number;
        product_id: number;
        rating: number;
        review: string | null;
        status: string | null;
        created_at: Date;
    }>;
}
//# sourceMappingURL=product_review.service.d.ts.map