import { ProductReviewService } from "../services/product_review.service.js";
import { createProductReviewSchema } from "../validators/product_review.schema.js";
const service = new ProductReviewService();
export const getAllProductReviews = async (req, res) => {
    try {
        const data = await service.getAll();
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const createProductReview = async (req, res) => {
    try {
        const input = createProductReviewSchema.parse(req.body);
        const data = await service.create({ ...input, user_id: req.user.id });
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res
            .status(400)
            .json({ success: false, message: error.errors || error.message });
    }
};
//# sourceMappingURL=product_review.controller.js.map