import { Request, Response } from "express";
import { SubcategoryService } from "../services/subcategory.service";
import { createSubcategorySchema } from "../validators/subcategory.schema";

const subcategoryService = new SubcategoryService();

export const getSubcategories = async (req: Request, res: Response) => {
  try {
    const subcats = await subcategoryService.getAllSubcategories();
    res.json({ success: true, data: subcats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubcategory = async (req: Request, res: Response) => {
  try {
    const validatedData = createSubcategorySchema.parse(req.body);
    const subcat = await subcategoryService.createSubcategory(validatedData);
    res.status(201).json({ success: true, data: subcat });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};
