import { prisma } from "../prisma.js";
export class WishlistRepository {
    async getWishlistByUserId(userId) {
        return prisma.wishlist.findUnique({
            where: { user_id: userId },
            include: { items: { include: { product: true } } },
        });
    }
    async createWishlist(userId) {
        return prisma.wishlist.create({ data: { user_id: userId } });
    }
    async addItem(wishlistId, productId) {
        return prisma.wishlistItem.create({
            data: { wishlist_id: wishlistId, product_id: productId },
        });
    }
    async removeItem(wishlistId, productId) {
        return prisma.wishlistItem.deleteMany({
            where: { wishlist_id: wishlistId, product_id: productId },
        });
    }
}
//# sourceMappingURL=wishlist.repository.js.map