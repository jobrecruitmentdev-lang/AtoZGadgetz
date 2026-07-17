import { ShipmentService } from "../services/shipment.service.js";
import { createShipmentSchema } from "../validators/shipment.schema.js";
const service = new ShipmentService();
export const getAllShipments = async (req, res) => {
    try {
        const data = await service.getAll();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const createShipment = async (req, res) => {
    try {
        const input = createShipmentSchema.parse(req.body);
        const data = await service.create(input);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res
            .status(400)
            .json({ success: false, message: error.errors || error.message });
    }
};
//# sourceMappingURL=shipment.controller.js.map