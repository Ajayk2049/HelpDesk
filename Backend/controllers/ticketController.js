import { now } from "mongoose";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

export const createTicket = async (req, res) => {
  try {
    // accept either title or topic from the client (client currently sends { topic })
    const { title, topic } = req.body;
    const ticketTitle = title || topic || "Untitled";

    console.log("Decoded User:", req.user);

    // set createdBy so schema validation passes, also include topic for frontend compatibility
    const newTicket = new Ticket({
      title: ticketTitle,
      topic: ticketTitle, // keep 'topic' so ClientDashboard (which expects ticket.topic) works
      createdBy: req.user._id, // matches schema required field
      messages: [],
    });

    await newTicket.save();

    // return under `ticket` because your client expects data.ticket
    res.status(200).json({ ticket: newTicket });
  } catch (err) {
    console.error("Error Creating Ticket", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error While Creating Ticket" });
  }
};

export const getTickets = async (req, res) => {
  console.log("🔥 getTickets controller called");

  try {
    let query = {};

    if (req.user.role === "admin") {
      query = {};
    } else if (req.user.role === "client") {
      query = { createdBy: req.user._id };
    } else if (req.user.role === "support") {
      query = { assignedTo: req.user._id };
    }
    const tickets = await Ticket.find(query)
      .populate("createdBy", "email role")
      .populate("assignedTo", "email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ tickets });
  } catch (err) {
    console.error("Error Fetching Tickets", err);
    return res
      .status(500)
      .json({ message: "Server Error While Fetching Tickets" });
  }
};

export const assignSupportAgent = async (req, res) => {
  const { ticketId, agentId } = req.body;

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (agentId === "") {
      // Unassign the support agent
      ticket.assignedTo = undefined;
    } else {
      // Assign the support agent
      const agent = await User.findById(agentId);
      if (!agent || agent.role !== "support") {
        return res.status(400).json({ message: "Invalid support agent" });
      }
      ticket.assignedTo = agent._id;
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticketId)
      .populate("createdBy", "_id email role")
      .populate("assignedTo", "_id email role");
      res.status(200).json({ message: "Support agent updated", ticket: updatedTicket });
  } catch (err) {
    console.error("Error Assigning Agent", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const resolveTicket = async (req, res) => {
  const { ticketId, finalMessage } = req.body;
  console.log("🛠️ Resolving ticket:", req.body.ticketId);

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket Not Found" });
    }
    if (ticket.resolved) {
      return res.status(400).json({ message: "Ticket Already Resolved" });
    }
    ticket.resolved = true;

    if (finalMessage) {
      ticket.messages.push({
        sender: req.user._id, // Fixed: Use _id consistently
        text: finalMessage,
        timestamp: new Date(),
      });
    }
    await ticket.save();
    res.status(200).json({ message: "Ticket Resolved", ticket });
  } catch (err) {
    console.error("Ticket Resolve Error", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error On Ticket Resolve" });
  }
};

export const getAssignedTickets = async (req, res) => {
  try {
    if (req.user.role !== "support") {
      return res.status(403).json({ message: "Access Denied" });
    }
    const tickets = await Ticket.find({ assignedTo: req.user._id })
      .populate("createdBy", "_id email role")
      .populate("messages.sender", "_id email role")
      .sort({ updatedAt: -1 });
    res.status(200).json({ tickets });
  } catch (err) {
    console.error("Error Getting Assinged Tickets", err);
    return res
      .status(500)
      .json({ message: "Server Error While Getting Assigned Tickets" });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(401).json({ message: "Ticket Not Found" });
    }
    res.status(200).json({ message: "Ticket Deleted" });
  } catch (err) {
    console.error("Error While Deleting Ticket", err);
    return res
      .status(500)
      .json({ message: "Server Error While Deleting Ticket" });
  }
};

export const requestAgent = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket Not Found" });
    }
    ticket.needsAgent = true;

    ticket.messages.push({
      sender: req.user._id,
      text: "Client Requested Agent Support",
      system: true,
      timestamp: new Date(),
    });
    ticket.status = "awaiting_agent";
    await ticket.save();
    const updatedTicket = await Ticket.findById(ticketId).populate(
      "messages.sender",
      "_id email role"
    );
    return res
      .status(200)
      .json({ message: "Agent Request Noted", ticket: updatedTicket });
  } catch (err) {
    console.error("Agent Request Failed", err);
    return res
      .status(500)
      .json({ message: "server error while requesting agent" });
  }
};

export const awaitingAgent = async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: "awaiting_agent" })
      .populate("createdBy", "_id email role")
      .populate("messages.sender", "_id email role");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.messages });
  }
};
