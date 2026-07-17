import { InventoryService } from "../services/inventory.service.js";
import { createInventorySchema } from "../validators/inventory.schema.js";
const service = new InventoryService();
export const getAllInventorys = async (req, res) => {
    try {
        const data = await service.getAll();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const createInventory = async (req, res) => {
    try {
        const input = createInventorySchema.parse(req.body);
        const data = await service.create(input);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res
            .status(400)
            .json({ success: false, message: error.errors || error.message });
    }
};
export const updateInventory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const validatedData = createInventorySchema.partial().parse(req.body);
        const inventory = await service.updateInventory(id, validatedData);
        res.json({ success: true, data: inventory });
    }
    catch (error) {
        res
            .status(400)
            .json({ success: false, message: error.errors || error.message });
    }
};
export const deleteInventory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await service.deleteInventory(id);
        res.json({ success: true, message: "Inventory deleted" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=inventory.controller.js.map