import express from "express"
import protect from "../middleware/authMiddleware.js"
import isAdmin from "../middleware/isAdmin.js"
import { getAllUsers, getSupportAgents } from "../controllers/userController.js"

const router = express.Router();

router.get("/", protect, isAdmin, getAllUsers);
router.get("/support-agents", protect, isAdmin, getSupportAgents);

export default router;