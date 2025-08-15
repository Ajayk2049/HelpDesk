import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  image: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default MessageSchema;
