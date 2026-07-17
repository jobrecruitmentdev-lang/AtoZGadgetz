export declare class MediaFileService {
    getAll(): Promise<{
        id: number;
        user_id: number;
        file_name: string;
        file_path: string;
        file_type: string;
        file_size: number;
        folder: string;
        created_at: Date;
    }[]>;
    getById(id: number): Promise<{
        id: number;
        user_id: number;
        file_name: string;
        file_path: string;
        file_type: string;
        file_size: number;
        folder: string;
        created_at: Date;
    } | null>;
    create(data: any): Promise<{
        id: number;
        user_id: number;
        file_name: string;
        file_path: string;
        file_type: string;
        file_size: number;
        folder: string;
        created_at: Date;
    }>;
}
//# sourceMappingURL=media_file.service.d.ts.map