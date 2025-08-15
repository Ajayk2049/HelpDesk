import mongoose from "mongoose"

const ConnectDB = async ()=> {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log (`DB connected ${conn.connection.host}`);
    } catch (error){
        console.log("DB error", error.message);
        process.exit(1);
    }
}
export default ConnectDB;