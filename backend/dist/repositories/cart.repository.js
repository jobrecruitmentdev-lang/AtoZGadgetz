import { prisma } from "../prisma.js";
export class CartRepository {
    async getCartByUserId(userId) {
        return prisma.cart.findUnique({
            where: { user_id: userId },
            include: { items: { include: { product: true } } },
        });
    }
    async createCart(userId) {
        return prisma.cart.create({ data: { user_id: userId } });
    }
    async addItemToCart(cartId, productId, quantity, price) {
        return prisma.cartItem.create({
            data: { cart_id: cartId, product_id: productId, quantity, price },
        });
    }
    async updateItemQuantity(itemId, quantity) {
        return prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });
    }
    async removeItem(itemId) {
        return prisma.cartItem.delete({ where: { id: itemId } });
    }
}
//# sourceMappingURL=cart.repository.js.map