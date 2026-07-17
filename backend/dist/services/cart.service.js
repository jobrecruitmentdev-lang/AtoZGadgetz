import { CartRepository } from "../repositories/cart.repository.js";
import { prisma } from "../prisma.js";
const cartRepo = new CartRepository();
export class CartService {
    async getOrCreateCart(userId) {
        let cart = await cartRepo.getCartByUserId(userId);
        if (!cart) {
            cart = (await cartRepo.createCart(userId));
            cart = await cartRepo.getCartByUserId(userId);
        }
        return cart;
    }
    async addItem(userId, productId, quantity) {
        const cart = await this.getOrCreateCart(userId);
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            throw new Error("Product not found");
        const existingItem = cart?.items.find((i) => i.product_id === productId);
        if (existingItem) {
            return cartRepo.updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
        }
        return cartRepo.addItemToCart(cart.id, productId, quantity, Number(product.price));
    }
    async updateItem(itemId, quantity) {
        if (quantity <= 0) {
            return this.removeItem(itemId);
        }
        return cartRepo.updateItemQuantity(itemId, quantity);
    }
    async removeItem(itemId) {
        return prisma.cartItem.delete({ where: { id: itemId } });
    }
}
//# sourceMappingURL=cart.service.js.map