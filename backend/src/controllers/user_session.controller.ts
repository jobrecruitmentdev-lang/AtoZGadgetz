import { Request, Response } from "express";
import { UserSessionService } from "../services/user_session.service";

const service = new UserSessionService();

export const getAllUserSessions = async (req: Request, res: Response) => {
  try {
    const data = await service.getAllForUser(req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
