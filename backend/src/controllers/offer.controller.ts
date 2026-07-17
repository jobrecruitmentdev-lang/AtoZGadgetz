import { Request, Response } from "express";
import { OfferService } from "../services/offer.service";
import { createOfferSchema } from "../validators/offer.schema";

const service = new OfferService();

export const getAllOffers = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOffer = async (req: Request, res: Response) => {
  try {
    const input = createOfferSchema.parse(req.body);
    const data = await service.create(input);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const updateOffer = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const validatedData = createOfferSchema.partial().parse(req.body);
    const offer = await service.updateOffer(id, validatedData);
    res.json({ success: true, data: offer });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await service.deleteOffer(id);
    res.json({ success: true, message: "Offer deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
