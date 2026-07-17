import { PrismaClient } from '@prisma/client';
import { CjProductService } from '../services/cj/cj-product.service.js';
import { CjOrderService } from '../services/cj/cj-order.service.js';
import { CjShipmentService } from '../services/cj/cj-shipment.service.js';
const prisma = new PrismaClient();
export const searchCjProducts = async (req, res) => {
    try {
        const keyword = String(req.query.keyword || '');
        const page = Number(req.query.page || 1);
        const size = Number(req.query.size || 20);
        const raw = await CjProductService.searchProducts(keyword, page, size);
        // CJ listV2 wraps products inside content[0].productList — normalize to a flat list
        let list = [];
        if (Array.isArray(raw)) {
            list = raw;
        }
        else if (Array.isArray(raw?.list)) {
            list = raw.list;
        }
        else if (Array.isArray(raw?.content)) {
            for (const group of raw.content) {
                if (Array.isArray(group?.productList))
                    list.push(...group.productList);
            }
        }
        // Normalize each item to a stable shape the frontend CjBrowse expects
        const normalized = list.map((p) => ({
            pid: p.id || p.pid || '',
            name: p.nameEn || p.name || '',
            imageUrl: p.bigImage || p.imageUrl || '',
            price: parseFloat(p.sellPrice || p.nowPrice || p.price || '0'),
            currency: p.currency || 'USD',
        }));
        res.json({ success: true, data: { list: normalized, total: raw?.totalRecords || normalized.length } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getCjProductDetail = async (req, res) => {
    try {
        const pid = String(req.params.pid || '');
        const product = await CjProductService.getProductDetail(pid);
        res.json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const importCjProduct = async (req, res) => {
    try {
        const { cjPid, categoryId, subcategoryId, markupPercentage } = req.body;
        if (!cjPid || !categoryId || !subcategoryId) {
            return res.status(400).json({ success: false, message: 'cjPid, categoryId and subcategoryId are required' });
        }
        const product = await CjProductService.importProduct(cjPid, Number(categoryId), Number(subcategoryId), Number(markupPercentage || 2.0));
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const placeCjOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await CjOrderService.placeOrder(Number(orderId));
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const cancelCjOrder = async (req, res) => {
    try {
        const cjOrderId = String(req.params.cjOrderId || '');
        const ok = await CjOrderService.cancelOrder(cjOrderId);
        res.json({ success: ok });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const syncShipment = async (req, res) => {
    try {
        const { orderId } = req.params;
        // Best-effort sync; then always return current shipment data
        try {
            await CjShipmentService.syncShipment(Number(orderId));
        }
        catch { /* non-fatal */ }
        const data = await CjShipmentService.getTrackingInfo(Number(orderId));
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const syncAllShipments = async (_req, res) => {
    try {
        const results = await CjShipmentService.syncAllActiveShipments();
        res.json({ success: true, synced: results.length });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Auto-import a CJ product by pid — used when customer clicks "Add to Cart" on a CJ product
// Requires auth (customer or admin). Finds or creates the DB product, returns its id.
export const autoImportCjProduct = async (req, res) => {
    try {
        const { cjPid } = req.body;
        if (!cjPid)
            return res.status(400).json({ success: false, message: 'cjPid is required' });
        // Check if already imported
        const existing = await prisma.cjProduct.findUnique({
            where: { cj_pid: cjPid },
            include: { product: true },
        });
        if (existing?.product) {
            return res.json({ success: true, data: { productId: existing.product.id } });
        }
        // Find a default category + subcategory (use first available)
        const firstCat = await prisma.category.findFirst();
        const firstSub = await prisma.subCategory.findFirst({ where: { category_id: firstCat?.id } });
        if (!firstCat || !firstSub) {
            return res.status(500).json({ success: false, message: 'No categories found — please seed categories first.' });
        }
        const product = await CjProductService.importProduct(cjPid, firstCat.id, firstSub.id, 2.0);
        res.status(201).json({ success: true, data: { productId: product.id } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Called by CJ Dropshipping — no auth header, verify by IP allowlist in production
export const handleCjWebhook = async (req, res) => {
    try {
        await CjShipmentService.handleWebhook(req.body);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=cj.controller.js.map