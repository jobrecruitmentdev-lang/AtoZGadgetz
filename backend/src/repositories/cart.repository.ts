import { prisma } from "../prisma.js";

export class CartRepository {
  async getCartByUserId(userId: number) {
    return prisma.cart.findUnique({
      where: { user_id: userId },
      include: { items: { include: { product: true } } },
    });
  }

  async createCart(userId: number) {
    return prisma.cart.create({ data: { user_id: userId } });
  }

  async addItemToCart(
    cartId: number,
    productId: number,
    quantity: number,
    price: number,
  ) {
    return prisma.cartItem.create({
      data: { cart_id: cartId, product_id: productId, quantity, price },
    });
  }

  async updateItemQuantity(itemId: number, quantity: number) {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(itemId: number) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  }
}
