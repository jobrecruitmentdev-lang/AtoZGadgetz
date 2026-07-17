import { Request, Response } from "express";
import { ProductService } from "../services/product.service.js";
import { createProductSchema } from "../validators/product.schema.js";

const productService = new ProductService();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const product = await productService.createProduct({
      ...validatedData,
      created_by: req.user!.id,
    });
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const validatedData = createProductSchema.partial().parse(req.body);
    const product = await productService.updateProduct(id, validatedData);
    res.json({ success: true, data: product });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await productService.deleteProduct(id);
    res.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug ?? "");
    if (!slug)
      return res
        .status(400)
        .json({ success: false, message: "Slug is required" });
    const product = await productService.getProductBySlug(slug);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
