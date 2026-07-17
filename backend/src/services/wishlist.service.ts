import { WishlistRepository } from "../repositories/wishlist.repository";
import { prisma } from "../prisma";

const repo = new WishlistRepository();

export class WishlistService {
  async getOrCreateWishlist(userId: number) {
    let wishlist = await repo.getWishlistByUserId(userId);
    if (!wishlist) {
      await repo.createWishlist(userId);
      wishlist = await repo.getWishlistByUserId(userId);
    }
    return wishlist;
  }

  async addItem(userId: number, productId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    const wishlist = await this.getOrCreateWishlist(userId);
    const alreadyPresent = wishlist?.items.some(
      (i: any) => i.product_id === productId,
    );
    if (alreadyPresent) return wishlist;

    await repo.addItem(wishlist!.id, productId);
    return this.getOrCreateWishlist(userId);
  }

  async removeItem(userId: number, productId: number) {
    const wishlist = await this.getOrCreateWishlist(userId);
    await repo.removeItem(wishlist!.id, productId);
    return this.getOrCreateWishlist(userId);
  }
}
