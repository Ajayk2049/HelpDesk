import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return this.role !== "ai"; // password not required for AI role
    },
  },
  role: {
    type: String,
    enum: ["client", "support", "admin", "ai"],
    default: "client",
  },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.role === "ai") return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
