import express from "express"
import protect from "../middleware/authMiddleware.js"
import { replyToTicket, addMessageToTicket } from "../controllers/messageController.js"

const router = express.Router();

router.post("/reply/:ticketId", protect, replyToTicket);
router.post("/:id/message", protect, addMessageToTicket);

export default router;

