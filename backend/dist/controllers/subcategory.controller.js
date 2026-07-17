import { SubcategoryService } from "../services/subcategory.service.js";
import { createSubcategorySchema } from "../validators/subcategory.schema.js";
const subcategoryService = new SubcategoryService();
export const getSubcategories = async (req, res) => {
    try {
        const subcats = await subcategoryService.getAllSubcategories();
        res.json({ success: true, data: subcats });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const createSubcategory = async (req, res) => {
    try {
        const validatedData = createSubcategorySchema.parse(req.body);
        const subcat = await subcategoryService.createSubcategory(validatedData);
        res.status(201).json({ success: true, data: subcat });
    }
    catch (error) {
        res
            .status(400)
            .json({ success: false, message: error.errors || error.message });
    }
};
//# sourceMappingURL=subcategory.controller.js.map