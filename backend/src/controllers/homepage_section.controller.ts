import { Request, Response } from "express";
import { HomepageSectionService } from "../services/homepage_section.service";
import { createHomepageSectionSchema } from "../validators/homepage_section.schema";

const service = new HomepageSectionService();

export const getAllHomepageSections = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHomepageSection = async (req: Request, res: Response) => {
  try {
    const input = createHomepageSectionSchema.parse(req.body);
    const data = await service.create(input);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const updateHomepageSection = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const validatedData = createHomepageSectionSchema.partial().parse(req.body);
    const homepageSection = await service.updateHomepageSection(
      id,
      validatedData,
    );
    res.json({ success: true, data: homepageSection });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const deleteHomepageSection = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await service.deleteHomepageSection(id);
    res.json({ success: true, message: "HomepageSection deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
