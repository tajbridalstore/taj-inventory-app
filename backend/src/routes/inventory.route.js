const express = require("express");
const { getShopifyProductsInventory, getAmazonInventory } = require("../controllers/inventory.controller");


const router = express.Router();

router.route("/shopify").get(getShopifyProductsInventory);
router.route("/amazon").post(getAmazonInventory);



module.exports = router;