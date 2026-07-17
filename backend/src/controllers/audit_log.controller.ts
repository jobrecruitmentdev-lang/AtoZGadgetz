import { Request, Response } from "express";
import { AuditLogService } from "../services/audit_log.service.js";
import { createAuditLogSchema } from "../validators/audit_log.schema.js";

const service = new AuditLogService();

export const getAllAuditLogs = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAuditLog = async (req: Request, res: Response) => {
  try {
    const input = createAuditLogSchema.parse(req.body);
    const data = await service.create({ ...input, user_id: req.user!.id });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};
