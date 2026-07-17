import { prisma } from "../prisma.js";
export class OrderRepository {
    async findAll() {
        return prisma.order.findMany();
    }
    async findMyOrders(userId) {
        return prisma.order.findMany({
            where: { user_id: userId },
            include: { items: true },
            orderBy: { created_at: "desc" },
        });
    }
    async findById(id) {
        return prisma.order.findUnique({
            where: { id },
            include: { items: true, status_history: true },
        });
    }
    async create(data) {
        return prisma.order.create({ data });
    }
    // Transaction for placing order
    async placeOrder(userId, addressId, couponId) {
        return await prisma.$transaction(async (tx) => {
            // 1. Get Cart
            const cart = await tx.cart.findUnique({
                where: { user_id: userId },
                include: { items: { include: { product: true } } },
            });
            if (!cart || cart.items.length === 0) {
                throw new Error("Cart is empty");
            }
            // 2. Check Inventory and Decrement
            let subtotal = 0;
            for (const item of cart.items) {
                const inventory = await tx.inventory.findFirst({
                    where: { product_id: item.product_id },
                });
                if (!inventory || inventory.stock_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${item.product.name}`);
                }
                await tx.inventory.update({
                    where: { id: inventory.id },
                    data: { stock_quantity: inventory.stock_quantity - item.quantity },
                });
                subtotal += Number(item.price) * item.quantity;
            }
            // 3. Create Order
            const totalAmount = subtotal; // Simplified math for this example
            const orderNumber = `ORD-${Date.now()}`;
            const order = await tx.order.create({
                data: {
                    user_id: userId,
                    address_id: addressId,
                    order_number: orderNumber,
                    subtotal: subtotal,
                    total_amount: totalAmount,
                    coupon_id: couponId,
                },
            });
            // 4. Create Order Items
            for (const item of cart.items) {
                await tx.orderItem.create({
                    data: {
                        order_id: order.id,
                        product_id: item.product_id,
                        product_name: item.product.name,
                        quantity: item.quantity,
                        price: item.price,
                        subtotal: Number(item.price) * item.quantity,
                    },
                });
            }
            // 5. Create Status History
            await tx.orderStatusHistory.create({
                data: {
                    order_id: order.id,
                    new_status: "pending",
                    changed_by: userId,
                },
            });
            // 6. Clear Cart
            await tx.cartItem.deleteMany({
                where: { cart_id: cart.id },
            });
            return order;
        });
    }
    async updateStatus(id, status, changedBy) {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id } });
            if (!order)
                throw new Error("Order not found");
            const updatedOrder = await tx.order.update({
                where: { id },
                data: { order_status: status },
            });
            await tx.orderStatusHistory.create({
                data: {
                    order_id: id,
                    old_status: order.order_status,
                    new_status: status,
                    changed_by: changedBy,
                },
            });
            return updatedOrder;
        });
    }
}
//# sourceMappingURL=order.repository.js.map