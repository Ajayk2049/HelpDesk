import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const Signup = async (req ,res)=> {
   try {
     const {email , password , role , plan} = req.body
    const existingUser = await User.findOne({email})
    if (existingUser){
        return res.status(400).json({message: "User Already Exists"})
    }
    const hashedPassword = await bcrypt.hash(password , 10)

    const newUser = new User({
        email,
        password: hashedPassword,
        role: role || "client",
        plan: plan || "free",
    })

    await newUser.save();
    res.status(201).json({message: "SignUp Successful"});
   } catch(error){
    console.error("Signup Error" , error);
    res.status(500).json({message: "Server Error During Singup"});
   }
};

export const Login = async (req , res)=> {
    try {
      const{email , password} = req.body
      const user = await User.findOne({email});
      if(!user){
        return res.status(400).json({message: "Invalid Credentials"});
      }
      const passMatch = await bcrypt.compare(password , user.password)
      if (!passMatch){
        return res.status(400).json({message: "Invalid Password"})
      }
      const token = jwt.sign(
        {id: user._id, role: user.role , plan: user.plan}, process.env.JWT_SECRET,{expiresIn:"24h"}
      )
      res.status(200).json({
        message: "Login Successful",
        token,
        user:{
            id: user._id,
            email: user.email,
            role: user.role,
            plan: user.plan
        }
      });
    } catch(error){
        console.error("Login Error" , error);
        res.status(500).message({message:"Login Internal Server Error"})
    }
}