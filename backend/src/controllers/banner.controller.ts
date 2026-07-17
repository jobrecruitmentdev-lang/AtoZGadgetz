import { Request, Response } from "express";
import { BannerService } from "../services/banner.service.js";
import { createBannerSchema } from "../validators/banner.schema.js";

const service = new BannerService();

export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const input = createBannerSchema.parse(req.body);
    const data = await service.create(input);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const validatedData = createBannerSchema.partial().parse(req.body);
    const banner = await service.updateBanner(id, validatedData);
    res.json({ success: true, data: banner });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await service.deleteBanner(id);
    res.json({ success: true, message: "Banner deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
