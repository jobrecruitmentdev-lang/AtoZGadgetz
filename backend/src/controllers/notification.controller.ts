import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service.js";
import { createNotificationSchema } from "../validators/notification.schema.js";

const service = new NotificationService();

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const data = await service.getAllForUser(req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const input = createNotificationSchema.parse(req.body);
    const data = await service.create(input);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};
