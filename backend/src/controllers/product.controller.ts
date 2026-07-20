import { Request, Response } from "express";
import { ProductService } from "../services/product.service.js";
import { createProductSchema } from "../validators/product.schema.js";
import { prisma } from "../prisma.js";

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

export const liveSearch = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    if (!keyword || typeof keyword !== "string") {
      res.json({ list: [] });
      return;
    }

    const searchTerm = keyword.trim();
    if (searchTerm.length < 2) {
      res.json({ list: [] });
      return;
    }

    // Search local database using Prisma
    // We search name, description and filter for products that have a thumbnail or images
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
        ],
      },
      include: {
        images: true,
      },
      take: 5,
    });

    const list = products.map((p: any) => {
      let imageUrl = p.thumbnail_image;
      if (!imageUrl && p.images && p.images.length > 0) {
        imageUrl = p.images[0].url;
      }
      return {
        pid: p.slug, // Map slug to pid for the frontend router
        name: p.name,
        imageUrl: imageUrl || "/placeholder.svg",
        price: parseFloat(p.price.toString()),
      };
    });

    res.json({ list });
  } catch (error) {
    console.error("Live Search Error:", error);
    res.status(500).json({ list: [] });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug || "");
    
    // 1. Get the current product
    const currentProduct = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, category_id: true, subcategory_id: true }
    });

    if (!currentProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 2. Find related products in the same category or subcategory, excluding this one
    const recommendations = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: currentProduct.id } },
          {
            OR: [
              { subcategory_id: currentProduct.subcategory_id },
              { category_id: currentProduct.category_id }
            ]
          },
          { status: 'active', is_active: true }
        ]
      },
      include: {
        images: true,
        category: true,
      },
      take: 8,
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    console.error("Recommendations Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
