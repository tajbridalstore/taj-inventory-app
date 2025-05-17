const User = require("../models/auth.model");

const login = async(req,res)=>{
    try {
        const {name,email,passsword} = req.bod;
        if(!name || !email || !passsword){
            return res.status(400).json({
                success:false,
                message:"All Fields are required"
            })
        }
        const existingUser = await User.findOne({email}) 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}