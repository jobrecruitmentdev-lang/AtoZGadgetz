import { Request, Response } from "express";
import { AddressService } from "../services/address.service.js";
import { createAddressSchema } from "../validators/address.schema.js";

const service = new AddressService();

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const data = await service.getByUserId(req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAddress = async (req: Request, res: Response) => {
  try {
    const validatedData = createAddressSchema.parse(req.body);
    const data = await service.createAddress(req.user!.id, validatedData);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};
