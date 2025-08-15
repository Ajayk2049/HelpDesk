import jwt from "jsonwebtoken";

const GenerateToken = (userID) => {
  return jwt.sign({ id: userID }, process.env.JWT_SECRET, { expiresIn: "24h" });
};
export default GenerateToken;
