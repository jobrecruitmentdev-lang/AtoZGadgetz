import { Request, Response } from "express";
import { AnalyticsEventService } from "../services/analytics_event.service.js";
import { createAnalyticsEventSchema } from "../validators/analytics_event.schema.js";

const service = new AnalyticsEventService();

export const getAllAnalyticsEvents = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Intentionally unauthenticated — client-side tracking beacon, matches the
// public event-ingestion pattern used by the FastAPI analytics router.
export const createAnalyticsEvent = async (req: Request, res: Response) => {
  try {
    const input = createAnalyticsEventSchema.parse(req.body);
    const data = await service.create({
      ...input,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};
