import { Request, Response } from "express";
import { CategoryService } from "../services/category.service.js";
import { createCategorySchema } from "../validators/category.schema.js";
import { globalCache } from "../utils/cache.js";

const categoryService = new CategoryService();

export const getCategories = async (req: Request, res: Response) => {
  try {
    const onlyWithProducts = req.query.hasProducts === "true" || req.query.activeOnly === "true";
    const cacheKey = `categories_hasProducts_${onlyWithProducts}`;

    let categories = globalCache.get(cacheKey);
    if (!categories) {
      categories = await categoryService.getAllCategories(onlyWithProducts);
      globalCache.set(cacheKey, categories, 120); // Cache for 2 minutes
    }

    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(validatedData);
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const validatedData = createCategorySchema.partial().parse(req.body);
    const category = await categoryService.updateCategory(id, validatedData);
    res.json({ success: true, data: category });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await categoryService.deleteCategory(id);
    res.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
