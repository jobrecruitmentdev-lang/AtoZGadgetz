import { CartRepository } from "../repositories/cart.repository";
import { prisma } from "../prisma";

const cartRepo = new CartRepository();

export class CartService {
  async getOrCreateCart(userId: number) {
    let cart = await cartRepo.getCartByUserId(userId);
    if (!cart) {
      cart = (await cartRepo.createCart(userId)) as any;
      cart = await cartRepo.getCartByUserId(userId);
    }
    return cart;
  }

  async addItem(userId: number, productId: number, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    const existingItem = cart?.items.find(
      (i: any) => i.product_id === productId,
    );
    if (existingItem) {
      return cartRepo.updateItemQuantity(
        existingItem.id,
        existingItem.quantity + quantity,
      );
    }

    return cartRepo.addItemToCart(
      cart!.id,
      productId,
      quantity,
      Number(product.price),
    );
  }

  async updateItem(itemId: number, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }
    return cartRepo.updateItemQuantity(itemId, quantity);
  }

  async removeItem(itemId: number) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  }
}
