const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{type:String},
    mobile:{type:String},
    city:{type:String, require:true},
    pinCode:{type:String, require:true},
    state:{type:String},
    order:{type:mongoose.Schema.Types.ObjectId, ref:"order"}

});


const User = mongoose.model("User", userSchema);
module.exports = User;