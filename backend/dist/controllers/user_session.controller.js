import { UserSessionService } from "../services/user_session.service.js";
const service = new UserSessionService();
export const getAllUserSessions = async (req, res) => {
    try {
        const data = await service.getAllForUser(req.user.id);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=user_session.controller.js.map