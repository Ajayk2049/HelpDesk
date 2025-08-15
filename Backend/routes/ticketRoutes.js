import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createTicket,
  getTickets,
  assignSupportAgent,
  resolveTicket,
  getAssignedTickets,
  deleteTicket,
  requestAgent,
  awaitingAgent,
} from "../controllers/ticketController.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();
router.post("/create", protect, createTicket);
router.get("/all-tickets", protect, isAdmin, getTickets);
router.get("/my-tickets", protect, getTickets);
router.put("/assign-agent", protect, isAdmin, assignSupportAgent);
router.put("/resolve", protect, resolveTicket);
router.get("/assigned-tickets", protect, getAssignedTickets);
router.delete("/delete/:id", protect, deleteTicket);
router.patch("/:ticketId/needs-agent", protect, requestAgent);
router.get("/tickets/awaiting-agent", protect, isAdmin, awaitingAgent)

export default router;
