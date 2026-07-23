import { PrismaClient } from '@prisma/client';
import { CjProductService } from '../services/cj/cj-product.service.js';
import { CjOrderService } from '../services/cj/cj-order.service.js';
import { CjShipmentService } from '../services/cj/cj-shipment.service.js';
import { CjCategoryService } from '../services/cj/cj-category.service.js';
import { CjInventoryService } from '../services/cj/cj-inventory.service.js';
const prisma = new PrismaClient();
export const searchCjProducts = async (req, res) => {
    try {
        const keyword = String(req.query.keyword || '');
        const page = Number(req.query.page || 1);
        const size = Number(req.query.size || 20);
        const source = String(req.query.source || 'cj'); // 'cj' or 'local'
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
        const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;
        const countryCode = req.query.countryCode ? String(req.query.countryCode) : undefined;
        const minImages = Number(req.query.minImages || 1);
        if (source === 'local') {
            const skip = (page - 1) * size;
            const [products, total] = await prisma.$transaction([
                prisma.product.findMany({
                    where: {
                        fulfillment_type: 'cj',
                        name: { contains: keyword },
                        is_active: true
                    },
                    skip,
                    take: size,
                    include: { cj_product: true }
                }),
                prisma.product.count({
                    where: {
                        fulfillment_type: 'cj',
                        name: { contains: keyword },
                        is_active: true
                    }
                })
            ]);
            const normalized = products.map((p) => ({
                pid: p.cj_product?.cj_pid || p.sku,
                productNameEn: p.name,
                productSku: p.sku,
                sellPrice: Number(p.price),
                productImage: p.thumbnail_image || '',
                categoryName: p.category?.name || 'Gadget',
            }));
            return res.json({ success: true, data: { list: normalized, total } });
        }
        // If a quality filter is requested, route through the hunt path.
        if (minImages > 1) {
            const raw = await CjProductService.huntProducts(keyword, minImages, page, size, {
                minPrice,
                maxPrice,
                categoryId,
                countryCode,
            });
            const list = Array.isArray(raw?.list) ? raw.list : [];
            const normalized = list.map((p) => ({
                pid: p.pid || p.id || '',
                productNameEn: p.productNameEn || p.productName || p.nameEn || p.name || 'Trending Gadget',
                productSku: p.productSku || p.sku || '',
                sellPrice: parseFloat(p.sellPrice || p.nowPrice || p.price || '10.00'),
                productImage: p.productImage || p.bigImage || p.imageUrl || '',
                categoryName: p.categoryName || p.twoCategoryName || 'Gadget',
                huntedImageCount: p.huntedImageCount || 0,
            }));
            return res.json({ success: true, data: { list: normalized, total: raw?.total || normalized.length } });
        }
        // Default: Fetch live results directly from CJ Dropshipping API
        const rawData = await CjProductService.searchProducts(keyword, page, size, {
            minPrice,
            maxPrice,
            categoryId,
            countryCode
        });
        const rawList = Array.isArray(rawData?.list) ? rawData.list : [];
        const normalized = rawList.map((p) => ({
            pid: p.pid || p.id || '',
            productNameEn: p.productNameEn || p.productName || p.nameEn || p.name || 'Trending Gadget',
            productSku: p.productSku || p.sku || '',
            sellPrice: parseFloat(p.sellPrice || p.nowPrice || p.price || '10.00'),
            productImage: p.productImage || p.bigImage || p.imageUrl || '',
            categoryName: p.categoryName || p.twoCategoryName || 'Gadget',
        }));
        res.json({ success: true, data: { list: normalized, total: rawData?.total || normalized.length } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const huntCjProducts = async (req, res) => {
    try {
        const keyword = String(req.query.keyword || '');
        const minImages = Number(req.query.minImages || 3);
        const page = Number(req.query.page || 1);
        const size = Number(req.query.size || 20);
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
        const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;
        const countryCode = req.query.countryCode ? String(req.query.countryCode) : undefined;
        const raw = await CjProductService.huntProducts(keyword, minImages, page, size, {
            minPrice,
            maxPrice,
            categoryId,
            countryCode,
        });
        // Normalize the hunted products to match frontend expectations exactly
        const list = Array.isArray(raw?.list) ? raw.list : [];
        const normalized = list.map((p) => ({
            pid: p.pid || p.id || '',
            productNameEn: p.productNameEn || p.productName || p.nameEn || p.name || 'Trending Gadget',
            productSku: p.productSku || p.sku || '',
            sellPrice: parseFloat(p.sellPrice || p.nowPrice || p.price || '10.00'),
            productImage: p.productImage || p.bigImage || p.imageUrl || '',
            categoryName: p.categoryName || p.twoCategoryName || 'Gadget',
            huntedImageCount: p.huntedImageCount || 0,
        }));
        res.json({ success: true, data: { list: normalized, total: raw?.total || normalized.length } });
    }
    catch (error) {
        res.status(200).json({ success: false, message: error.message, data: { list: [], total: 0 } });
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
export const autoImportCjProduct = async (req, res) => {
    try {
        const { cjPid } = req.body;
        if (!cjPid)
            return res.status(400).json({ success: false, message: 'cjPid is required' });
        const existing = await prisma.cjProduct.findUnique({
            where: { cj_pid: cjPid },
            include: { product: true },
        });
        if (existing?.product) {
            return res.json({ success: true, data: { productId: existing.product.id } });
        }
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
export const getCjCategories = async (_req, res) => {
    try {
        const categories = await CjCategoryService.getCachedCategories();
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const syncCjCategories = async (_req, res) => {
    try {
        const result = await CjCategoryService.syncCategories();
        res.json({ success: true, ...result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const syncCjInventory = async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        const result = await CjInventoryService.syncProductInventory(productId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const syncAllCjInventory = async (_req, res) => {
    try {
        const result = await CjInventoryService.syncAllInventory();
        res.json({ success: true, ...result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const handleCjWebhook = async (req, res) => {
    try {
        await CjShipmentService.handleWebhook(req.body);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getCjHealth = async (_req, res) => {
    try {
        const health = await CjProductService.verifyConnection();
        res.json({ success: true, data: health });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=cj.controller.js.map