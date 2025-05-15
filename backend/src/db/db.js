const mongoose = require("mongoose");

const connectDB = async() =>{
    try {
       const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
       console.log(`MongoDB Connected HOST!! ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(error);
        console.log(`MongoDB  Connection failed`)
    }
}

module.exports = connectDB;