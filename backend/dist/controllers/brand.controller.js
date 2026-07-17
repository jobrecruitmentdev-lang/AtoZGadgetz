import { BrandService } from "../services/brand.service.js";
import { createBrandSchema } from "../validators/brand.schema.js";
const brandService = new BrandService();
export const getBrands = async (req, res) => {
    try {
        const brands = await brandService.getAllBrands();
        res.json({ success: true, data: brands });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const createBrand = async (req, res) => {
    try {
        const validatedData = createBrandSchema.parse(req.body);
        const brand = await brandService.createBrand(validatedData);
        res.status(201).json({ success: true, data: brand });
    }
    catch (error) {
        res
            .status(400)
            .json({ success: false, message: error.errors || error.message });
    }
};
export const updateBrand = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const validatedData = createBrandSchema.partial().parse(req.body);
        const brand = await brandService.updateBrand(id, validatedData);
        res.json({ success: true, data: brand });
    }
    catch (error) {
        res
            .status(400)
            .json({ success: false, message: error.errors || error.message });
    }
};
export const deleteBrand = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await brandService.deleteBrand(id);
        res.json({ success: true, message: "Brand deleted" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=brand.controller.js.map