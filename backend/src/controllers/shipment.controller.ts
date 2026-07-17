import { Request, Response } from "express";
import { ShipmentService } from "../services/shipment.service.js";
import { createShipmentSchema } from "../validators/shipment.schema.js";

const service = new ShipmentService();

export const getAllShipments = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createShipment = async (req: Request, res: Response) => {
  try {
    const input = createShipmentSchema.parse(req.body);
    const data = await service.create(input);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};
