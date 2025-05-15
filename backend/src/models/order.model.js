const mongoose = require("mongoose");

// Mobile Schema for managing mobile numbers
const mobileSchema = new mongoose.Schema({
  countryCode: { type: String, required: true },  // e.g., "+91"
  number: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{6,15}$/.test(v);  // Validates the phone number
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderFrom: {
    type: String,
    enum: ["whatsapp", "mirraw", "instagram"],
    default: ""
  },
  orderType: {
    type: String,
    enum: ["prepaid", "cod"],
    required: true  
  },
  orderId: {
    type: String,
    required: true,
    unique: true  
  },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "manifest", "cancelled", "intransit", "delivered", "returned", "replacement","replaced"],
      default: "pending"
    },
    amount:{type:Number,default:0},
    shippingCharge:{type:Number,default:0},
    courierCharge:{type:Number,default:0},
    newCourierCharge:{type:Number,default:0},
    returnCourierCharge:{type:Number,default:0},
    codAmount:{type:Number,default:0},
    totalAmount:{type:Number,default:0},
    advanceDiposite:{type:Number,default:0}
  }],
  orderDate: { type: Date, default: Date.now },
      courierCharge:{type:Number,default:0},
    newCourierCharge:{type:Number,default:0},
    returnCourierCharge:{type:Number,default:0},
  shippingCharges: { type: Number, default: 0 },
  advanceDiposite: { type: Number, default: 0 },
  codAmount: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },

  name: { type: String, required: true },
  address: { type: String, required: true },
  mobile: [mobileSchema], 
  city: { type: String, required: true },
  pinCode: { type: String, required: true },
  country: { type: String, default: "India" },
  note: { type: String, default: "" },

  trackingId: { type: String, default: "" },
  shipper: {
    type: String,
    enum: ["delhivery", "blueDart", "shipGlobal", "indianPost", "otherCourier"],

  },
  status: {
    type: String,
    enum: ["pending", "manifest", "cancelled", "intransit", "delivered", "returned", "replacement","replaced"],
    default: "pending"
  },
  dispatchedDate: { type: String, default: "" },
  courierCharges: { type: Number, default: 0 },
  deliveryDate: { type: String, default: "" },
  return: {
    type: String,
    enum: ["yes", "no"],
    default: "no"
  },
  newShippingCharge: { type: Number, default: 0 },
  dispatchImages: [String],
  detailsSendToCustomer: {
    type: String,
    enum: ["yes", "no"],
    default: "no"
  }
});


const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
