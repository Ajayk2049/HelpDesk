import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import ConnectDB from "../Backend/config/db.js";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { Server } from "socket.io";
import http from "http";
import User from "./models/User.js";

dotenv.config();
ConnectDB();

export let AI_USER_ID = null;

// Create/find AI user at startup
(async () => {
  try {
    let aiUser = await User.findOne({ email: "ai@helpdesk.com" });
    if (!aiUser) {
      aiUser = await User.create({
        email: "ai@helpdesk.com",
        password: "nopass", // unused
        role: "ai",
      });
      console.log("🤖 AI user created:", aiUser._id);
    } else {
      console.log("🤖 AI user found:", aiUser._id);
    }
    AI_USER_ID = aiUser._id;
  } catch (err) {
    console.error("❌ Failed to ensure AI user:", err);
  }
})();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("New Client Connected", socket.id);

  socket.on("join-ticket", (ticketId) => {
    const room = ticketId?.toString();
    if (room) {
      socket.join(room);
      console.log(`Socket ${socket.id} joined Room ${room}`);
    }
  });

  socket.on("send-message", ({ ticketId, message }) => {
    const room = ticketId?.toString();
    if (room) {
      socket.to(room).emit("receive-message", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client Disconnect", socket.id);
  });
});

export { io };

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
