export declare class AddressService {
    getByUserId(userId: number): Promise<{
        id: number;
        user_id: number;
        address_line1: string;
        address_line2: string | null;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        is_default: boolean | null;
        created_at: Date;
        updated_at: Date;
    }[]>;
    createAddress(userId: number, data: any): Promise<{
        id: number;
        user_id: number;
        address_line1: string;
        address_line2: string | null;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        is_default: boolean | null;
        created_at: Date;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=address.service.d.ts.map