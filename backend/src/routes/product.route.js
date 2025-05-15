const express = require("express");
const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  createProductOnShopify,
  getShopifyProduct,
  getAllShopifyProducts,
  getAmazonProduct,
} = require("../controllers/product.controller");
const { createFeedProduct, checkFeedStatus, getAllListedProducts } = require("../controllers/feed.controller");


const router = express.Router();


// app roduct routes
router.post("/create", createProduct);
router.get("/get-products", getAllProducts);
router.put("/update/:id", updateProduct);
router.delete("/delete/:id", deleteProduct);

// shopify product routes
router.route("/create-on-shopify").post(createProductOnShopify);
router.route("/get-shopify-product/:productId").get(getShopifyProduct);
router.route("/get-shopify-products").get(getAllShopifyProducts);

// amazon product routes
router.route("/feed-products").post(createFeedProduct);
router.route("/check-feed-status").get(checkFeedStatus);
router.route("/get-amazon-products").get(getAllListedProducts);
router.route("/get-amazon-product/:asin").get(getAmazonProduct);



module.exports = router;
