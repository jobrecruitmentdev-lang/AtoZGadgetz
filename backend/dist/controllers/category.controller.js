import { CategoryService } from "../services/category.service.js";
import { createCategorySchema } from "../validators/category.schema.js";
const categoryService = new CategoryService();
export const getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const createCategory = async (req, res) => {
    try {
        const validatedData = createCategorySchema.parse(req.body);
        const category = await categoryService.createCategory(validatedData);
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        res
            .status(400)
            .json({ success: false, message: error.errors || error.message });
    }
};
export const updateCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const validatedData = createCategorySchema.partial().parse(req.body);
        const category = await categoryService.updateCategory(id, validatedData);
        res.json({ success: true, data: category });
    }
    catch (error) {
        res
            .status(400)
            .json({ success: false, message: error.errors || error.message });
    }
};
export const deleteCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await categoryService.deleteCategory(id);
        res.json({ success: true, message: "Category deleted" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=category.controller.js.map