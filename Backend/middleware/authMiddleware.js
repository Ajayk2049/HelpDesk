import jwt from "jsonwebtoken";
import User from "../models/User.js"

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized, No Token" });
  }
  console.log("🔒 Incoming Authorization:", req.headers.authorization);

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
   
    next();
  } catch (err) {
    console.error("JWT Error", err);
    return res.status(401).json({ message: "Invalid Token" });
  }
};
export default protect;
