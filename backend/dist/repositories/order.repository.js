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
    async placeOrder(userId, payload) {
        return await prisma.$transaction(async (tx) => {
            let finalUserId = userId;
            let addressId = payload.address_id;
            // 1. Handle Guest / Shadow Account Creation
            if (!finalUserId && payload.guest) {
                // Try to find if user exists by email
                let shadowUser = await tx.user.findUnique({
                    where: { email: payload.guest.email }
                });
                if (!shadowUser) {
                    // Get default Customer role
                    const customerRole = await tx.role.findFirst({ where: { role_name: "Customer" } });
                    if (!customerRole)
                        throw new Error("Customer role not found in system");
                    // We'll hardcode a dummy hash since this is a shadow account
                    shadowUser = await tx.user.create({
                        data: {
                            email: payload.guest.email,
                            first_name: payload.guest.firstName,
                            last_name: payload.guest.lastName || "",
                            mobile: payload.guest.phone || Date.now().toString(),
                            password_hash: "shadow_account_no_password",
                            role_id: customerRole.id,
                            is_active: false // Shadow accounts are inactive until they verify
                        }
                    });
                }
                finalUserId = shadowUser.id;
            }
            if (!finalUserId)
                throw new Error("Could not determine user for checkout");
            // 2. Handle Address Creation
            if (!addressId && payload.address) {
                const newAddress = await tx.userAddress.create({
                    data: {
                        user_id: finalUserId,
                        address_line1: payload.address.address_line1,
                        address_line2: payload.address.address_line2 || null,
                        city: payload.address.city,
                        state: payload.address.state,
                        postal_code: payload.address.postal_code,
                        country: payload.address.country,
                    }
                });
                addressId = newAddress.id;
            }
            if (!addressId)
                throw new Error("No shipping address provided");
            // 3. Resolve Items (from payload for guests/buy now, or from cart for logged in users)
            let itemsToOrder = [];
            let cartIdToClear = null;
            if (payload.items && payload.items.length > 0) {
                itemsToOrder = payload.items.map((i) => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                    price: Number(i.price),
                    product: { name: i.name || "Product" }
                }));
            }
            else {
                const cart = await tx.cart.findUnique({
                    where: { user_id: finalUserId },
                    include: { items: { include: { product: true } } },
                });
                if (!cart || cart.items.length === 0) {
                    throw new Error("Cart is empty");
                }
                itemsToOrder = cart.items;
                cartIdToClear = cart.id;
            }
            // 4. Calculate Subtotal (Ignoring inventory check for prototype checkout service simplicity)
            let subtotal = 0;
            for (const item of itemsToOrder) {
                subtotal += Number(item.price) * item.quantity;
            }
            // 5. Create Order
            const totalAmount = subtotal; // Ignoring shipping/coupons for now
            const orderNumber = `ORD-${Date.now()}`;
            const order = await tx.order.create({
                data: {
                    user_id: finalUserId,
                    address_id: addressId,
                    order_number: orderNumber,
                    subtotal: subtotal,
                    total_amount: totalAmount,
                    coupon_id: payload.coupon_id || null,
                },
            });
            // 6. Create Order Items
            for (const item of itemsToOrder) {
                await tx.orderItem.create({
                    data: {
                        order_id: order.id,
                        product_id: item.product_id,
                        product_name: item.product?.name || "Product",
                        quantity: item.quantity,
                        price: item.price,
                        subtotal: Number(item.price) * item.quantity,
                    },
                });
            }
            // 7. Create Status History
            await tx.orderStatusHistory.create({
                data: {
                    order_id: order.id,
                    new_status: "pending",
                    changed_by: userId || null, // Guest checkout might not have changed_by if shadow
                },
            });
            // 8. Clear Cart if it was a cart checkout
            if (cartIdToClear) {
                await tx.cartItem.deleteMany({
                    where: { cart_id: cartIdToClear },
                });
            }
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