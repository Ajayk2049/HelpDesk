import mongoose from "mongoose";
import MessageSchema from "./Message.js";

const TicketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: function () {
        return this.isNew;
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.isNew;
      },
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    messages: [MessageSchema],
    status:{ type: String, enum:["open", "awaiting_agent","resolved"], default:"open"},
    needsAgent: { type: Boolean, default: false },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", TicketSchema);
