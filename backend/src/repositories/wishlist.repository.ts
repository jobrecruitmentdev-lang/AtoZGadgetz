import { prisma } from "../prisma.js";

export class WishlistRepository {
  async getWishlistByUserId(userId: number) {
    return prisma.wishlist.findUnique({
      where: { user_id: userId },
      include: { items: { include: { product: true } } },
    });
  }

  async createWishlist(userId: number) {
    return prisma.wishlist.create({ data: { user_id: userId } });
  }

  async addItem(wishlistId: number, productId: number) {
    return prisma.wishlistItem.create({
      data: { wishlist_id: wishlistId, product_id: productId },
    });
  }

  async removeItem(wishlistId: number, productId: number) {
    return prisma.wishlistItem.deleteMany({
      where: { wishlist_id: wishlistId, product_id: productId },
    });
  }
}
