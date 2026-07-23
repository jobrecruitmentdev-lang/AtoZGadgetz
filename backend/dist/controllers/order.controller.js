import { OrderService } from "../services/order.service.js";
import { createOrderSchema, updateOrderStatusSchema, } from "../validators/order.schema.js";
const service = new OrderService();
export const getAllOrders = async (req, res) => {
    try {
        const data = await service.getAll();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getMyOrders = async (req, res) => {
    try {
        const data = await service.getMyOrders(req.user.id);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getOrderById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await service.getById(id);
        if (!data)
            return res
                .status(404)
                .json({ success: false, message: "Order not found" });
        // Check if the order belongs to the user or if the user is an admin.
        // req.user!.role is the Role relation object, so compare against role_name.
        if (data.user_id !== req.user.id &&
            !["Admin", "Super Admin"].includes(req.user.role?.role_name)) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getOrderInvoice = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = await service.getInvoiceById(id);
        if (!data) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        const isOwner = data.user_id === req.user.id;
        const userRoleStr = String(req.user?.role?.role_name || req.user?.role || '').toLowerCase();
        const isAdmin = isOwner || ['admin', 'super admin', 'superadmin'].includes(userRoleStr);
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        const invoice = {
            invoice_number: `INV-${data.order_number}`,
            invoice_date: data.created_at,
            order_number: data.order_number,
            customer: {
                name: `${data.user.first_name} ${data.user.last_name || ""}`.trim(),
                email: data.user.email,
                mobile: data.user.mobile,
            },
            shipping_address: {
                line1: data.address.address_line1,
                line2: data.address.address_line2,
                city: data.address.city,
                state: data.address.state,
                postal_code: data.address.postal_code,
                country: data.address.country,
            },
            items: data.items.map((item) => ({
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
            })),
            pricing: {
                subtotal: data.subtotal,
                discount: data.offer_discount,
                shipping_charge: data.shipping_charge,
                total_amount: data.total_amount,
            },
            payment: {
                status: data.payment_status || "pending",
                method: data.payment?.payment_method || null,
                transaction_id: data.payment?.transaction_id || null,
            },
        };
        res.json({ success: true, data: invoice });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const placeOrder = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: "Please sign in and complete your profile before checkout.",
            });
        }
        if (!req.user.first_name || !req.user.last_name || !req.user.mobile || req.user.is_active === false) {
            return res.status(400).json({
                success: false,
                message: "Profile incomplete. Please complete your profile before placing an order.",
            });
        }
        const payload = createOrderSchema.parse(req.body);
        const order = await service.placeOrder(req.user?.id, payload);
        res
            .status(201)
            .json({
            success: true,
            message: "Order placed successfully",
            data: order,
        });
    }
    catch (error) {
        res
            .status(400)
            .json({ success: false, message: error.errors || error.message });
    }
};
export const updateOrderStatus = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = updateOrderStatusSchema.parse(req.body);
        const order = await service.updateStatus(id, status, req.user.id);
        res.json({ success: true, message: "Order status updated", data: order });
    }
    catch (error) {
        res
            .status(400)
            .json({ success: false, message: error.errors || error.message });
    }
};
//# sourceMappingURL=order.controller.js.map