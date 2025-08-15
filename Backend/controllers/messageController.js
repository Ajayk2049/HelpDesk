import Ticket from "../models/Ticket.js";
import { io } from "../server.js";
import { askGeminiRaw } from "./aiController.js";
import User from "../models/User.js";

let aiUserId = null;
async function getAIUserId() {
  if (aiUserId) return aiUserId;

  let aiUser = await User.findOne({ role: "ai" });
  if (!aiUser) {
    aiUser = await User.create({
      email: "ai@system.local",
      role: "ai",
    });
  }

  aiUserId = aiUser._id;
  return aiUserId;
}

export const replyToTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { text, image } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Text Is Required" });
  }

  try {
    console.log("Reply Route Hit");
    console.log("Ticket ID:", ticketId);
    console.log("Message Body:", req.body);
    console.log("User ID from middleware:", req.user._id);

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket Not Found" });
    }

    // ✅ ADD THIS BLOCK (before your existing `if (ticket.needsAgent) { ... }` that returns 400)
    if (
      ticket.needsAgent &&
      (req.user?.role === "support" || req.user?.role === "admin")
    ) {
      // Save support/admin reply WITHOUT AI
      ticket.messages.push({
        sender: req.user._id,
        text,
        image,
      });

      await ticket.save();

      // Populate sender so frontend gets role/email for rendering/alignment
      const updatedForSupport = await Ticket.findById(ticketId).populate(
        "messages.sender",
        "_id email role"
      );

      // Emit the newly added human message
      const latestHuman =
        updatedForSupport.messages[updatedForSupport.messages.length - 1];
      io.to(ticketId.toString()).emit("receive-message", latestHuman);

      return res
        .status(200)
        .json({ message: "Support Reply Added", ticket: updatedForSupport });
    }

    if (ticket.needsAgent) {
      console.log("AI Disabled Waiting For Human Support");
      return res
        .status(400)
        .json({ message: "This Ticket Is Now Handled By Support Agent" });
    }

    // Save user's message
    ticket.messages.push({
      sender: req.user._id,
      text,
      image,
    });

    // Get AI reply
    const aiReply = await askGeminiRaw(text);

    // Save AI's message
    const aiSenderId = await getAIUserId();
    ticket.messages.push({
      sender: aiSenderId,
      text: aiReply,
    });

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticketId).populate(
      "messages.sender",
      "_id email role"
    );

    // Emit only the AI message to socket listeners
    const latest = updatedTicket.messages[updatedTicket.messages.length - 1];
    io.to(ticketId.toString()).emit("receive-message", latest);

    res.status(200).json({ message: "Reply Added", ticket: updatedTicket });
  } catch (err) {
    console.error("Error Replying To Ticket", err);
    res.status(500).json({ message: "Internal Server Error While Replying" });
  }
};

export const addMessageToTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(400).json({ message: "Ticket Not Found" });
    }
    const newMessage = {
      sender: req.user._id,
      text: req.body.text,
    };
    console.log("Ticket found?", !!ticket, ticket);
    ticket.messages.push(newMessage);
    await ticket.save();
    io.to(ticket._id.toString()).emit("receive-message", newMessage);
    res.status(200).json(newMessage);
  } catch (err) {
    console.error("Add Message Error", err);
    res.status(500).json({ message: "Server Error While Sending Message" });
  }
};
