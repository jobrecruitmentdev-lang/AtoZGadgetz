import { Prisma } from "@prisma/client";
export declare class UserRepository {
    findByEmailOrMobile(email: string, mobile: string): Promise<{
        id: number;
        role_id: number;
        first_name: string;
        last_name: string | null;
        email: string;
        mobile: string;
        password_hash: string;
        profile_image: string | null;
        is_active: boolean | null;
        created_at: Date;
        updated_at: Date | null;
    } | null>;
    findByEmail(email: string): Promise<{
        id: number;
        role_id: number;
        first_name: string;
        last_name: string | null;
        email: string;
        mobile: string;
        password_hash: string;
        profile_image: string | null;
        is_active: boolean | null;
        created_at: Date;
        updated_at: Date | null;
    } | null>;
    create(data: Prisma.UserUncheckedCreateInput): Promise<{
        id: number;
        role_id: number;
        first_name: string;
        last_name: string | null;
        email: string;
        mobile: string;
        password_hash: string;
        profile_image: string | null;
        is_active: boolean | null;
        created_at: Date;
        updated_at: Date | null;
    }>;
}
//# sourceMappingURL=user.repository.d.ts.map