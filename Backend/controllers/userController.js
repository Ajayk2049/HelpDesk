import User from "../models/User.js"

export const getSupportAgents = async (req, res)=> {
    try {
      const agents = await User.find({role: "support"}).select("_id email")
      res.status(200).json(agents)
    } catch(err){
        console.error(err)
        res.status(500).json({message:"Server Error While Fetching Agents"});
    }
};

export const getAllUsers = async (req, res) => {
  console.log("👑 getAllUsers called by", req.user?.email, req.user?.role);
  try {
    const users = await User.find({}, "_id email role plan");
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
