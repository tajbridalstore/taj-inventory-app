const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required:true  },
    relatedSku: [{
      sku: { type: String },
      quantity: { type: Number }
    }],
    quantity:{ type: Number,required:true },
    compare_at_price: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    size: { type: [mongoose.Schema.Types.Mixed], default: [] },
    color: { type: [mongoose.Schema.Types.Mixed], default: [] },
    style: { type: [mongoose.Schema.Types.Mixed], default: [] },
    part_number: { type: [mongoose.Schema.Types.Mixed], default: [] },
    purchasable_offer: { type: [mongoose.Schema.Types.Mixed], default: [] },
    child_parent_sku_relationship: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    fulfillment_availability: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    main_product_image_locator: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    other_product_image_locator_1: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    other_product_image_locator_2: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    other_product_image_locator_3: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    other_product_image_locator_4: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    other_product_image_locator_5: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  productTitle: { type: String, default: "" },
  productType: { type: String, default: "BRACELET" },
  requirements: { type: String, default: "LISTING" },
  product_type: { type: String },
  title: { type: String, required:true },
  productImage:  { type: [mongoose.Schema.Types.Mixed], default: [], },
  tags: [{ type: String }],
  bullet_point: { type: [mongoose.Schema.Types.Mixed], default: [] },
  body_html: [{ type: String }],
  sku: { type: String,required:true, unique:true  },
  relatedSku: [{sku:{type:String} }],
  status: {
    type: String,
    enum: ["active", "draft", "archived"],
    default: "active",
  },
  item_name: { type: [mongoose.Schema.Types.Mixed], default: [], },
  product_description: { type: [mongoose.Schema.Types.Mixed], default: [] },
  part_number: { type: [mongoose.Schema.Types.Mixed], default: [] },
  parentage_level: { type: [mongoose.Schema.Types.Mixed], default: [] },
  metal_type: { type: [mongoose.Schema.Types.Mixed], default: [] },
  material: { type: [mongoose.Schema.Types.Mixed], default: [] },
  metals: { type: [mongoose.Schema.Types.Mixed], default: [] },

  main_product_image_locator: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  other_product_image_locator_1: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  other_product_image_locator_2: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  other_product_image_locator_3: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  other_product_image_locator_4: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  other_product_image_locator_5: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  variants: [variantSchema],
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
