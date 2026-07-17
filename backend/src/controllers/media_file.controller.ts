import { Request, Response } from "express";
import { MediaFileService } from "../services/media_file.service";
import { createMediaFileSchema } from "../validators/media_file.schema";

const service = new MediaFileService();

export const getAllMediaFiles = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMediaFile = async (req: Request, res: Response) => {
  try {
    const input = createMediaFileSchema.parse(req.body);
    const data = await service.create({ ...input, user_id: req.user!.id });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};
