const express = require("express");
const { getAmazonOrderItem, getAllAmazonOrders, getAllShopifyOrders, getShopifyOrderItem, createAppOrder, getAppOrders, updateAppOrderIntransit, getAppOrderById, updateAppOrderManifest, updateAppOrderDelivered, cancelAppOrder, cancelAppOrderWithStatus, createReplacementOrder } = require("../controllers/order.controller");
const upload = require("../middlewares/multer.middlewares");

const router = express.Router();

router.route("/get-amazon-order/:orderId").get(getAmazonOrderItem);
router.route("/get-shopify-order/:orderId").get(getShopifyOrderItem);
router.route("/get-amazon-orders").get(getAllAmazonOrders);
router.route("/get-shopify-orders").get(getAllShopifyOrders);
router.route("/create-order").post(createAppOrder);
router.route("/re-create-order").post(createReplacementOrder);
router.route("/cancel-order").post(cancelAppOrder);
router.route("/cancel-order-with-status").post(cancelAppOrderWithStatus);
router.route("/get-app-orders").get(getAppOrders);
router.route("/app-order-update").put(updateAppOrderManifest);
router.route("/app-order-update-delivered").put(updateAppOrderDelivered);
router.route("/app-order-update-intransit").put(upload.array("dispatchImages"),updateAppOrderIntransit);
router.route("/get-app-order/:orderId").get(getAppOrderById);
router.route("/get-app-order/:orderId").get(getAppOrderById);

module.exports = router;