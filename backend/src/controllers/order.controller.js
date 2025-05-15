const axios = require("axios");
const getAccessToken = require("../utils/genarateToken");
const { fetchAllAmazonOrders } = require("../utils/fetchAllAmazonOrders");
const NodeCache = require("node-cache")
const { fetchAllShopifyOrders } = require("../utils/fetchAllShopifyOrders");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN
const SHOPIFY_ORDER_API = process.env.SHOPIFY_ORDER_API
const SHOPIFY_PRODUCT_API = `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/products/`
const mongoose = require("mongoose");
const fs = require('fs');
const uploadFileToCloudinary = require("../utils/cloudinary");


///////////////////////////////////////////  APP ORDER   ////////////////////////////////////////////
const createAppOrder = async (req, res) => {
  try {
    let {
      orderFrom,
      orderType,
      orderId,
      orderItems,
      orderDate,
      advanceDiposite,
      name,
      mobile,
      city,
      pinCode,
      country,
      address,
      note,
    } = req.body;

    // Validate required fields
    if (!orderId || !name || !mobile || !city || !pinCode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updates = [];
    const populatedOrderItems = [];

    for (const item of orderItems) {
      // Find the product containing the ordered variant
      const product = await Product.findOne({ 'variants.sku': item.sku });
      if (!product) {
        return res.status(400).json({ message: `Product not found for SKU: ${item.sku}` });
      }

      const orderedVariant = product.variants.find(v => v.sku === item.sku);
      if (!orderedVariant) {
        return res.status(400).json({ message: `Variant not found for SKU: ${item.sku} in product ${product._id}` });
      }

      if (orderedVariant.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient quantity for SKU: ${item.sku}. Available: ${orderedVariant.quantity}, Requested: ${item.quantity}` });
      }

      // Update the quantity of the ordered variant
      updates.push({
        updateOne: {
          filter: { _id: product._id, 'variants.sku': item.sku },
          update: { $inc: { 'variants.$.quantity': -item.quantity } },
        },
      });

      // Update the quantities of related SKUs (which might be in other products)
      if (orderedVariant.relatedSku && orderedVariant.relatedSku.length > 0) {
        for (const related of orderedVariant.relatedSku) {
          const relatedProduct = await Product.findOne({ 'variants.sku': related.sku });
          if (relatedProduct) {
            const relatedVariant = relatedProduct.variants.find(v => v.sku === related.sku);
            if (relatedVariant) {
              const quantityToReduce = related.quantity * item.quantity;
              if (relatedVariant.quantity < quantityToReduce) {
                console.warn(`Insufficient quantity for related SKU: ${related.sku} in product ${relatedProduct._id}. Available: ${relatedVariant.quantity}, Required: ${quantityToReduce}`);
                // Optionally, you could prevent the order or handle this differently
              } else {
                updates.push({
                  updateOne: {
                    filter: { _id: relatedProduct._id, 'variants.sku': related.sku },
                    update: { $inc: { 'variants.$.quantity': -quantityToReduce } },
                  },
                });
              }
            } else {
              console.warn(`Related SKU ${related.sku} not found in product ${relatedProduct._id}`);
            }
          } else {
            console.warn(`Product not found for related SKU: ${related.sku}`);
          }
        }
      }

      populatedOrderItems.push({
        product: product._id,
        quantity: item.quantity,
        status: "pending",
        variant: orderedVariant._id,
        variantDetails: { sku: orderedVariant.sku },
      });
    }

    // Calculate the amount from variant prices
    let amount = 0;
    for (const item of populatedOrderItems) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      const variant = product.variants.find(v => v.sku === item.variantDetails.sku);
      if (variant?.price) {
        amount += variant.price * item.quantity;
      }
    }

    // Calculate shippingCharges, codAmount, totalAmount
    let shippingCharges = 100;
    let codAmount;
    let totalAmount;

    if (amount < 1000) {
      if (orderType.toLowerCase() === "cod" && (advanceDiposite === undefined || advanceDiposite <= 0)) {
        totalAmount = amount + shippingCharges;
        codAmount = totalAmount;
      } else if (orderType.toLowerCase() === "cod" && advanceDiposite > 0) {
        totalAmount = amount + shippingCharges;
        codAmount = totalAmount - advanceDiposite;
      } else if (orderType.toLowerCase() === "prepaid") {
        totalAmount = amount + shippingCharges;
        codAmount = 0;
      }
    } else {
      shippingCharges = 0;
      if (orderType.toLowerCase() === "cod" && (advanceDiposite === undefined || advanceDiposite <= 0)) {
        totalAmount = amount;
        codAmount = totalAmount;
      } else if (orderType.toLowerCase() === "cod" && advanceDiposite > 0) {
        totalAmount = amount;
        codAmount = totalAmount - advanceDiposite;
      } else if (orderType.toLowerCase() === "prepaid") {
        totalAmount = amount;
        codAmount = 0;
      }
    }

    // Create new order
    const newOrder = new Order({
      orderFrom,
      orderType,
      orderId,
      orderItems: populatedOrderItems,
      orderDate,
      shippingCharges,
      advanceDiposite,
      codAmount,
      amount,
      totalAmount,
      name,
      mobile,
      city,
      pinCode,
      country,
      address,
      note,
    });

    // Execute the quantity updates and save the order atomically
    const [savedOrder] = await Promise.all([
      newOrder.save(),
      Product.bulkWrite(updates),
    ]);

    // Populate product in order items before sending
    const populatedSavedOrder = await Order.findById(savedOrder._id).populate('orderItems.product');

    res.status(201).json({
      message: "Order created successfully",
      order: populatedSavedOrder,
      success: true,
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ message: "Server error while creating order" });
  }
};


/////////////////////////////////////////////////////////////////////////////////////////////////////
const getAmazonOrderItem = async (req, res) => {
  try {
    const { orderId } = req.params;
    const accessToken = await getAccessToken();

    const apiUrl = `${process.env.ORDER_API}/${orderId}/orderItems`;

    const response = await axios.get(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        "x-amz-access-token": accessToken,
      },
    });

    const orderItems = response.data.payload.OrderItems;

    // Fetch images for all ASINs in parallel
    const itemsWithImages = await Promise.all(
      orderItems.map(async (item) => {
        try {
          const catalogApiUrl = `https://sellingpartnerapi-eu.amazon.com/catalog/2022-04-01/items/${item.ASIN}?marketplaceIds=A21TJRUUN4KGV&includedData=images`;

          const catalogResponse = await axios.get(catalogApiUrl, {
            headers: {
              "Content-Type": "application/json",
              "x-amz-access-token": accessToken,
            },
          });

          const image = catalogResponse.data.images?.[0]?.images?.[0]?.link || null;
          return { ...item, image };
        } catch (err) {
          console.error(`Error fetching image for ASIN ${item.ASIN}:`, err.message);
          return { ...item, image: null };
        }
      })
    );

    const dataWithImages = {
      AmazonOrderId: response.data.payload.AmazonOrderId,
      OrderItems: itemsWithImages,
    };

    res.status(200).json({
      message: "Order item get successfully",
      success: true,
      data: dataWithImages,
    });

  } catch (error) {
    console.error("Error in getting order:", error);
    res.status(500).json({
      message: "Error get order",
      success: false,
      error: error.response ? error.response.data : error.message,
    });
  }
};


// const getAmazonOrderItem = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const accessToken = await getAccessToken();

//     // Fetch order items
//     const orderApiUrl = `${process.env.ORDER_API}/${orderId}/orderItems`;

//     const orderResponse = await axios.get(orderApiUrl, {
//       headers: {
//         "Content-Type": "application/json",
//         "x-amz-access-token": accessToken,
//       }
//     });


//     const orderItems = orderResponse.data.payload.OrderItems || [];

//     // Now, for each item, fetch its image from Catalog API
//     const itemsWithImages = await Promise.all(orderItems.map(async (item) => {
//       const asin = item.ASIN; // make sure item has ASIN

//       if (!asin) return { ...item, image: null }; // if ASIN missing, skip image

//       try {
//         const catalogApiUrl = `https://sellingpartnerapi-eu.amazon.com/catalog/2022-04-01/items/${asin}?marketplaceIds=A21TJRUUN4KGV&includedData=images`;

//         const catalogResponse = await axios.get(catalogApiUrl, {
//           headers: {
//             "Content-Type": "application/json",
//             "x-amz-access-token": accessToken,
//           }
//         });

//         // Extract the image from Catalog API response
//         const images = catalogResponse.data?.images || [];
//         const mainImage = images.length > 0 ? images[0].images[0].link : null;

//         return {
//           ...item,
//           image: mainImage,
//         };

//       } catch (err) {
//         console.error(`Error fetching catalog data for ASIN ${asin}:`, err.message);
//         return {
//           ...item,
//           image: null,
//         };
//       }
//     }));
// console.log(itemsWithImages)
//     res.status(200).json({
//       message: "Order items with images fetched successfully",
//       success: true,
//       data: itemsWithImages,
//     });

//   } catch (error) {
//     console.error("Error in getting order items:", error);
//     res.status(500).json({
//       message: "Error fetching order items",
//       success: false,
//       error: error.response ? error.response.data : error.message,
//     });
//   }
// };


//////////////////////////////////////////////////

const getAllAmazonOrders = async (req, res) => {
  const cache = new NodeCache({ stdTTL: 3600 });
  try {
    const orders = "amazon_orders";

    // 🔍 1. Check cache
    const cachedOrders = cache.get(orders);

    if (cachedOrders) {
      return res.status(200).json({
        message: "Orders fetched from cache",
        success: true,
        count: cachedOrders.length,
        data: cachedOrders,
      });
    }

    // 🛑 2. If no cache, fetch from Amazon
    const accessToken = await getAccessToken();
    const allOrders = await fetchAllAmazonOrders(accessToken);

    // 💾 3. Store in cache
    cache.set(orders, allOrders);

    // ✅ 4. Return fresh data
    res.status(200).json({
      message: "All orders fetched from Amazon",
      success: true,
      count: allOrders.length,
      data: allOrders,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      success: false,
      error: error.message,
    });
  }
};

////////////////////////////////////////////

const getAllShopifyOrders = async (req, res) => {
  const cache = new NodeCache({ stdTTL: 3600 });
  try {
    const shopifyOrders = "shopify_orders";
console.log("first")
    // 🔍 1. Check cache
    const cachedOrders = cache.get(shopifyOrders);

    if (cachedOrders) {
      return res.status(200).json({
        message: "Orders fetched from cache",
        success: true,
        count: cachedOrders.length,
        data: cachedOrders,
      });
    }

    // 🛑 2. If no cache, fetch from Shopify
    const allOrders = await fetchAllShopifyOrders(accessToken); // Assuming token is handled inside the service

    // 💾 3. Store in cache
    cache.set(shopifyOrders, allOrders);
    console.log(allOrders)
    // ✅ 4. Return fresh data
    res.status(200).json({
      message: "All orders fetched from Shopify",
      success: true,
      count: allOrders.length,
      data: allOrders,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      success: false,
      error: error.message,
    });
  }
};

///////////////////////////////////////////////

const getShopifyOrderItem = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1. Fetch the order details
    const orderApiUrl = `${SHOPIFY_ORDER_API}/${orderId}.json?fields=id,line_items,name,total_price`;
    const orderResponse = await axios.get(orderApiUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    const orderData = orderResponse.data.order;

    // 2.  Process line items to get product images
    const lineItemsWithImages = await Promise.all(
      orderData.line_items.map(async (item) => {
        const productId = item.product_id;
        if (!productId) {
          return { ...item, images: [] };
        }
        const productImagesUrl = `${SHOPIFY_PRODUCT_API}/${productId}/images.json`;
        try {
          const productImagesResponse = await axios.get(productImagesUrl, {
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": accessToken,
            },
          });
          const images = productImagesResponse.data.images || [];
          return { ...item, images };
        } catch (error) {
          console.error(`Error fetching images for product ${productId}:`, error);
          return { ...item, images: [] };
        }
      })
    );

    const orderWithImages = {
      ...orderData,
      line_items: lineItemsWithImages,
    };

    // 3. Send the response
    res.status(200).json({
      message: "Order item get successfully",
      success: true,
      data: orderWithImages,
    });
  } catch (error) {
    console.error("Error in getting order:", error);
    res.status(500).json({
      message: "Error get order",
      success: false,
      error: error.response ? error.response.data : error.message,
    });
  }
};

///////////////////////////////////////////////////////////////////


const getAppOrders = async (req, res) => {

  try {
      const orders = await Order.find().populate('orderItems.product'); // Populate product details
 
      if (!orders || orders.length === 0) { // Check for null or empty array
          return res.status(404).json({
              message: "Orders not found",
              success: false
          });
      }
      return res.status(200).json({
          success: true,
          orders
      });
  } catch (error) {
      console.error("Error getting orders:", error);
      res.status(500).json({ message: "Server error while getting orders", error: error.message });
  }
};

///////////////////////////////////////////////////////////////////

const updateAppOrderManifest = async (req, res) => {
  try {
    const { orderId, manifestItems } = req.body;
    console.log(req.body);

    if (!orderId || !manifestItems || !Array.isArray(manifestItems) || manifestItems.length === 0) {
      return res.status(400).json({ error: "Invalid input: orderId and manifestItems are required, and manifestItems must be a non-empty array." });
    }

    const order = await Order.findOne({ orderId }).populate('orderItems.product');
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    let orderItemsUpdated = [];
    let updatedOrder = null;

    // Initialize remaining shipping and advance deposit from the order
    let remainingShipping = order.shippingCharges || 0;
    let remainingAdvanceDeposit = order.advanceDiposite || 0;

    for (const manifestItem of manifestItems) {
      const { sku: manifestSku, quantity: manifestQuantity } = manifestItem;

      if (!manifestSku || typeof manifestQuantity !== 'number' || manifestQuantity <= 0) {
        return res.status(400).json({ error: "Invalid input: Each manifestItem must have a valid sku and quantity greater than zero." });
      }

      // Find the corresponding order item
      const orderItemToUpdateIndex = order.orderItems.findIndex(item => {
        if (item.product && item.product.variants && item.product.variants.length > 0) {
          return item.product.variants.some(variant => variant.sku === manifestSku);
        }
        const productSku = item.product.sku;
        return productSku === manifestSku;
      });

      if (orderItemToUpdateIndex === -1) {
        return res.status(400).json({ error: `Order item with SKU ${manifestSku} not found in order ${orderId}` });
      }

      const orderItemToUpdate = order.orderItems[orderItemToUpdateIndex];

      if (manifestQuantity > orderItemToUpdate.quantity) {
        return res.status(400).json({ error: `Manifest quantity (${manifestQuantity}) exceeds order item quantity (${orderItemToUpdate.quantity}) for SKU ${manifestSku}` });
      }
      if (orderItemToUpdate.status === 'manifest') {
        return res.status(400).json({ error: `Order Item with SKU ${manifestSku} is already in manifest status` });
      }

      // Calculate proportional shipping and advance deposit
      const itemShipping = (remainingShipping / orderItemToUpdate.quantity) * manifestQuantity;
      const itemAdvanceDeposit = (remainingAdvanceDeposit / orderItemToUpdate.quantity) * manifestQuantity;

      // Update remaining amounts
      remainingShipping -= itemShipping;
      remainingAdvanceDeposit -= itemAdvanceDeposit;

      // Calculate amount and total amount for the item
      let itemAmount = 0;
      if (orderItemToUpdate.product && orderItemToUpdate.product.variants && orderItemToUpdate.product.variants.length > 0) {
        const variant = orderItemToUpdate.product.variants.find(v => v.sku === manifestSku);
        if (variant) {
          itemAmount = variant.price * manifestQuantity;
        } else {
          itemAmount = orderItemToUpdate.product.price * manifestQuantity;
        }
      } else if (orderItemToUpdate.product) {
        itemAmount = orderItemToUpdate.product.price * manifestQuantity;
      }
      const itemTotalAmount = itemAmount + itemShipping - itemAdvanceDeposit;

      // Calculate codAmount if orderType is "cod"
      const itemCodAmount = order.orderType === 'cod' ? itemTotalAmount : 0;

      // Handle partial and full quantity updates
      if (manifestQuantity === orderItemToUpdate.quantity) {
        order.orderItems[orderItemToUpdateIndex].status = "manifest";
        order.orderItems[orderItemToUpdateIndex].shippingCharge = itemShipping;
        order.orderItems[orderItemToUpdateIndex].advanceDiposite = itemAdvanceDeposit;
        order.orderItems[orderItemToUpdateIndex].amount = itemAmount;
        order.orderItems[orderItemToUpdateIndex].totalAmount = itemTotalAmount;
        order.orderItems[orderItemToUpdateIndex].codAmount = itemCodAmount; // Assign codAmount

        orderItemsUpdated.push({
          sku: manifestSku,
          quantity: manifestQuantity,
          status: "manifest",
          shippingCharge: itemShipping,
          advanceDiposite: itemAdvanceDeposit,
          amount: itemAmount,
          totalAmount: itemTotalAmount,
          codAmount: itemCodAmount, // Include codAmount
        });
      } else {
        const newOrderItem = {
          ...orderItemToUpdate,
          quantity: manifestQuantity,
          status: "manifest",
          _id: new mongoose.Types.ObjectId(),
          product: orderItemToUpdate.product,
          shippingCharge: itemShipping,
          advanceDiposite: itemAdvanceDeposit,
          amount: itemAmount,
          totalAmount: itemTotalAmount,
          codAmount: itemCodAmount, // Assign codAmount
        };
        orderItemsUpdated.push({
          sku: manifestSku,
          quantity: manifestQuantity,
          status: "manifest",
          shippingCharge: itemShipping,
          advanceDiposite: itemAdvanceDeposit,
          amount: itemAmount,
          totalAmount: itemTotalAmount,
          codAmount: itemCodAmount, // Include codAmount
        });
        order.orderItems.push(newOrderItem);

        order.orderItems[orderItemToUpdateIndex].quantity -= manifestQuantity;
        const remainingSku = manifestSku.replace(`_${manifestQuantity}`, `_${orderItemToUpdate.quantity}`);
        orderItemsUpdated.push({
          sku: remainingSku,
          quantity: orderItemToUpdate.quantity - manifestQuantity,
          status: orderItemToUpdate.status,
        });
      }
    }

    // Update the order with the remaining shipping and advance deposit
    order.shippingCharges = remainingShipping;
    order.advanceDiposite = remainingAdvanceDeposit;

    updatedOrder = await order.save();

    res.json({
      message: "Order items updated successfully",
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error manifesting order item:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/////////////////////////////////////////////////////////////////////////////

const updateAppOrderIntransit = async (req, res) => {
  try {
    const {
      trackingNumber,
      courierCharges,
      shipper,
      detailsSendToCustomer,
      orderId,
    } = req.body;
    const items = JSON.parse(req.body.items); // Expecting an array of orderItem objects with their _id

    // Upload images
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const localPath = file.path;
        const cloudinaryResponse = await uploadFileToCloudinary(localPath);
        if (cloudinaryResponse) {
          uploadedImages.push(cloudinaryResponse.secure_url);
        }
        fs.unlinkSync(localPath);
      }
    }

    // 1. Find the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // 2. Update courier-related fields at the order level
    order.trackingNumber = trackingNumber;
    order.shipper = shipper;
    order.courierCharge += courierCharges;
    order.detailsSendToCustomer = detailsSendToCustomer;
    if (uploadedImages.length > 0) {
      order.dispatchImages = uploadedImages;
    }

    // 3. Update the status and courierCharges of specific orderItems
    if (items && items.length > 0) {
      for (const item of items) {
        if (item._id) { // Assuming each item in 'items' has the _id of the orderItem
          const updateResult = await Order.updateOne(
            { "orderId": orderId, "orderItems._id": item._id },
            { "$set": { "orderItems.$.status": "intransit", "orderItems.$.courierCharge": courierCharges } }
          );
          if (updateResult.modifiedCount === 0) {
            console.warn(`OrderItem with ID ${item._id} not found or not updated.`);
          }
        } else {
          console.warn("OrderItem ID not found in the received item:", item);
        }
      }
    }

    // Update the total courier charges for the order (optional, based on your requirement)
    order.courierCharge = courierCharges;
    await order.save(); // Save the order with updated courier details and potentially total courier charges

    // Refetch the fully updated order to send in the response
    const updatedOrder = await Order.findOne({ orderId }).populate("orderItems.product");

    return res.status(200).json({
      success: true,
      message: "Selected order items updated to intransit successfully",
      data: {
        order: updatedOrder, // Send the entire updated Order document
      },
    });
  } catch (error) {
    console.error("Update dispatch error:", error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

///////////////////////////////////////////////////////////////////////

const getAppOrderById = async (req, res) => {
  console.log("first")
  try {
      const orderId = req.params.orderId; // Assuming the order ID is passed as a route parameter

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
          return res.status(400).json({ message: "Invalid Order ID", success: false });
      }

      const order = await Order.findById(orderId).populate('orderItems.product');
console.log(order)
      if (!order) {
          return res.status(404).json({ message: "Order not found", success: false });
      }

      return res.status(200).json({
          success: true,
          order
      });
  } catch (error) {
      console.error("Error getting order by ID:", error);
      res.status(500).json({ message: "Server error while getting order", error: error.message });
  }
};
////////////////////////////////////////////////////////////////

const updateAppOrderDelivered = async (req, res) => {
  console.log("deliveredOrder");

  try {
    const { orderId,courierCharges } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required." });
    }

    // Populate the product inside orderItems
    const order = await Order.findOne({ orderId }).populate("orderItems.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    

    const updatedItems = order.orderItems.filter(item => item.status === "intransit");

    if (updatedItems.length === 0) {
      return res.status(404).json({ message: "No items with status 'intransit' found." });
    }

    updatedItems.forEach(item => {
      item.status = "delivered";
      item.courierCharge = courierCharges;
    });

    order.courierCharge =courierCharges
    await order.save();

    // Optionally re-populate after save (Mongoose doesn't always retain populated fields post-save)
    const populatedOrder = await Order.findOne({ orderId }).populate("orderItems.product");

    return res.status(200).json({
      message: "All intransit order items have been updated to delivered.",
      updatedOrder: populatedOrder,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Server error." });
  }
};
////////////////////////////////////////////////////////////
const updateAppOrderDispatch = async (req, res) => {
  console.log("Dispatch");
  console.log(req.body);
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required." });
    }

    // Populate the product inside orderItems
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const updatedItems = order.orderItems.filter(item => item.status === "intransit");

    if (updatedItems.length === 0) {
      return res.status(404).json({ message: "No items with status 'intransit' found." });
    }

    updatedItems.forEach(item => {
      item.status = "intransit";
    });

    await order.save();

    // Optionally re-populate after save (Mongoose doesn't always retain populated fields post-save)
    const populatedOrder = await Order.findOne({ orderId }).populate("orderItems.product");

    return res.status(200).json({
      message: "All intransit order items have been updated to delivered.",
      updatedOrder: populatedOrder,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Server error." });
  }
};
//////////////////////////////////////////////////
const cancelAppOrder = async (req, res) => {
  try {
    const { orderId, orderItems } = req.body; // Receive orderId and orderItems array
console.log(req.body)
    // Find the order to update its status
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const updates = [];

    for (const item of orderItems) {
      if (item && item.sku && item.quantity > 0) {
        // Find the product containing the variant
        const product = await Product.findOne({ 'variants.sku': item.sku });
        if (!product) {
          console.warn(`Product not found for SKU: ${item.sku}`);
          continue;
        }

        const variantToUpdate = product.variants.find(v => v.sku === item.sku);
        if (!variantToUpdate) {
          console.warn(`Variant not found for SKU: ${item.sku} in product ${product._id}`);
          continue;
        }

        // Increase the quantity of the variant
        updates.push({
          updateOne: {
            filter: { _id: product._id, 'variants.sku': item.sku },
            update: { $inc: { 'variants.$.quantity': +item.quantity } },
          },
        });

        // Increase the quantities of related SKUs
        if (variantToUpdate.relatedSku && variantToUpdate.relatedSku.length > 0) {
          for (const related of variantToUpdate.relatedSku) {
            const relatedProduct = await Product.findOne({ 'variants.sku': related.sku });
            if (relatedProduct) {
              const relatedVariant = relatedProduct.variants.find(v => v.sku === related.sku);
              if (relatedVariant) {
                const quantityToIncrease = related.quantity * item.quantity;
                updates.push({
                  updateOne: {
                    filter: { _id: relatedProduct._id, 'variants.sku': related.sku },
                    update: { $inc: { 'variants.$.quantity': +quantityToIncrease } },
                  },
                });
              } else {
                console.warn(`Related SKU ${related.sku} not found in product ${relatedProduct._id}`);
              }
            } else {
              console.warn(`Product not found for related SKU: ${related.sku}`);
            }
          }
        }
      } else {
        console.warn(`Invalid item in orderItems array: ${JSON.stringify(item)}`);
      }
    }

    // Execute the quantity updates
    if (updates.length > 0) {
      await Product.bulkWrite(updates);
    }

    // Update the order status to "cancelled"
    order.status = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled and restocked successfully",
      // You can return the updated order or a success message
    });
  } catch (error) {
    console.error("Error cancelling order and restocking:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order and restock products.",
      error: error.message,
    });
  }
};

////////////////////////////////////////////
const cancelAppOrderWithStatus = async (req, res) => {
  try {
    const { orderId, orderItemIds } = req.body;


    // Find the order
    const order = await Order.findOne({ orderId }).populate("orderItems.product");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!orderItemIds || !Array.isArray(orderItemIds) || orderItemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide orderItemIds to cancel specific items.",
      });
    }

    let itemsCancelledCount = 0;
    const updates = [];

    for (let item of order.orderItems) {
      if (orderItemIds.includes(item._id.toString())) {
        const currentStatus = item.status;
        item.status = "cancelled";
        itemsCancelledCount++;

        const sku = item.product?.variants?.[0]?.sku; // Access SKU from variants

        if (["intransit", "pending", "manifest"].includes(currentStatus) && sku && item.quantity > 0) {
          const { quantity } = item;

          const product = await Product.findOne({ 'variants.sku': sku });
          if (product) {
            const variantToUpdate = product.variants.find(v => v.sku === sku);
            if (variantToUpdate) {
              updates.push({
                updateOne: {
                  filter: { _id: product._id, 'variants.sku': sku },
                  update: { $inc: { 'variants.$.quantity': quantity } },
                },
              });

              // Related SKUs
              if (variantToUpdate.relatedSku && variantToUpdate.relatedSku.length > 0) {
                for (const related of variantToUpdate.relatedSku) {
                  const relatedProduct = await Product.findOne({ 'variants.sku': related.sku });
                  if (relatedProduct) {
                    const relatedVariant = relatedProduct.variants.find(v => v.sku === related.sku);
                    if (relatedVariant) {
                      const quantityToIncrease = related.quantity * quantity;
                      updates.push({
                        updateOne: {
                          filter: { _id: relatedProduct._id, 'variants.sku': related.sku },
                          update: { $inc: { 'variants.$.quantity': quantityToIncrease } },
                        },
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Bulk write quantity updates
    if (updates.length > 0) {
      const bulkWriteResult = await Product.bulkWrite(updates);
      console.log("Bulk Write Result:", bulkWriteResult); // Log the result
    }

    // Save the order with updated item statuses
    await order.save();

    return res.status(200).json({
      success: true,
      message: `${itemsCancelledCount} item(s) cancelled successfully.`,
      order,
    });
  } catch (error) {
    console.error("Error cancelling order items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order items.",
      error: error.message,
    });
  }
};

////////////////////////////////////

const createReplacementOrder = async (req, res) => {
  try {
    const {
      originalOrderId,
      replacedItems,
    } = req.body;

    if (!originalOrderId || !replacedItems || replacedItems.length === 0) {
      return res.status(400).json({
        message:
          'Missing required fields (originalOrderId, replacedItems)',
      });
    }

    let originalOrder;
    try {
      originalOrder = await Order.findOne({ orderId: originalOrderId }).populate({
        path: 'orderItems.product',
        populate: { path: 'variants' },
      });
    } catch (error) {
      return res.status(500).json({
        message:
          'Error fetching original order.',
        error: error.message
      });
    }

    if (!originalOrder) {
      console.log('Original order not found');
      return res.status(404).json({ message: 'Original order not found' });
    }

    const restockUpdates = [];
    const newOrderItems = [];
    let newOrderAmount = 0;
    const orderDataForNewOrder = {
      orderFrom: originalOrder.orderFrom,
      orderType: originalOrder.orderType,
      orderDate: originalOrder.orderDate,
      advanceDiposite: originalOrder.advanceDiposite,
      name: originalOrder.name,
      mobile: originalOrder.mobile,
      city: originalOrder.city,
      pinCode: originalOrder.pinCode,
      country: originalOrder.country,
      address: originalOrder.address,
      note: originalOrder.note,
    };

    const processedOriginalItems = new Set();

    for (const originalItem of originalOrder.orderItems) {
      const replacedItem = replacedItems.find(
        (ri) => ri.originalOrderItemId === originalItem._id.toString()
      );

      if (replacedItem) {
        if (!originalItem.product || !originalItem.product.variants || originalItem.product.variants.length === 0) {
          return res.status(400).json({
            message: `No variants found for product ${originalItem.product?._id} in original order item ${originalItem._id}`,
          });
        }
        const originalVariant = originalItem.product.variants[0];

        if (!originalVariant) {
          return res.status(400).json({
            message: `Original variant not found for item ${originalItem._id}`,
          });
        }

        restockUpdates.push({
          updateOne: {
            filter: {
              _id: originalItem.product._id,
              'variants.sku': originalVariant.sku,
            },
            update: { $inc: { 'variants.$.quantity': originalItem.quantity } },
          },
        });

        if (
          originalVariant.relatedSku &&
          originalVariant.relatedSku.length > 0
        ) {
          for (const related of originalVariant.relatedSku) {
            const relatedProduct = await Product.findOne({
              'variants.sku': related.sku,
            });
            if (relatedProduct) {
              const relatedVariantData = relatedProduct.variants.find(
                (v) => v.sku === related.sku
              );
              if (relatedVariantData) {
                const quantityToRestock =
                  related.quantity * originalItem.quantity;
                restockUpdates.push({
                  updateOne: {
                    filter: {
                      _id: relatedProduct._id,
                      'variants.sku': related.sku,
                    },
                    update: {
                      $inc: { 'variants.$.quantity': quantityToRestock },
                    },
                  },
                });
              }
            }
          }
        }

        const newProduct = await Product.findOne({
          'variants.sku': replacedItem.newSku,
        });
        if (!newProduct) {
          return res.status(400).json({
            message: `Product not found for new SKU: ${replacedItem.newSku}`,
          });
        }
        const newVariant = newProduct.variants.find(
          (v) => v.sku === replacedItem.newSku
        );
        if (!newVariant) {
          return res.status(400).json({
            message: `Variant not found for SKU: ${replacedItem.newSku} in product ${newProduct._id}`,
          });
        }

        if (newVariant.quantity < originalItem.quantity) {
          return res.status(400).json({
            message: `Insufficient quantity for new SKU: ${replacedItem.newSku}. Available: ${newVariant.quantity}, Requested: ${originalItem.quantity}`,
          });
        }

        restockUpdates.push({
          updateOne: {
            filter: {
              _id: newProduct._id,
              'variants.sku': replacedItem.newSku,
            },
            update: { $inc: { 'variants.$.quantity': -originalItem.quantity } },
          },
        });

        if (newVariant.relatedSku && newVariant.relatedSku.length > 0) {
          for (const related of newVariant.relatedSku) {
            const relatedProductNew = await Product.findOne({
              'variants.sku': related.sku,
            });
            if (relatedProductNew) {
              const relatedVariantDataNew = relatedProductNew.variants.find(
                (v) => v.sku === related.sku
              );
              if (relatedVariantDataNew) {
                const quantityToReduce =
                  related.quantity * originalItem.quantity;
                if (relatedVariantDataNew.quantity < quantityToReduce) {
                  console.warn(
                    `Insufficient quantity for related SKU: ${related.sku} in product ${relatedProductNew._id}. Available: ${relatedVariantDataNew.quantity}, Required: ${quantityToReduce}`
                  );
                } else {
                  restockUpdates.push({
                    updateOne: {
                      filter: {
                        _id: relatedProductNew._id,
                        'variants.sku': related.sku,
                      },
                      update: {
                        $inc: { 'variants.$.quantity': -quantityToReduce },
                      },
                    },
                  });
                }
              }
            }
          }
        }

        newOrderItems.push({
          product: newProduct._id,
          quantity: originalItem.quantity,
          status: 'pending',
          variant: newVariant._id,
          variantDetails: { sku: newVariant.sku },
        });
        newOrderAmount += newVariant.price * originalItem.quantity;
        processedOriginalItems.add(originalItem._id);
      } else {
        if (!originalItem.product || !originalItem.product.variants || originalItem.product.variants.length === 0) {
          return res.status(400).json({
            message: `No variants found for product ${originalItem.product?._id} in original order item ${originalItem._id}`,
          });
        }
        const originalVariant = originalItem.product.variants[0];

        if (!originalVariant) {
          return res.status(400).json({
            message: `Original variant not found for item ${originalItem._id}`,
          });
        }
        newOrderItems.push({
          product: originalItem.product._id,
          quantity: originalItem.quantity,
          status: 'pending',
          variant: originalVariant._id,
          variantDetails: { sku: originalVariant.sku },
        });
        newOrderAmount += originalVariant.price * originalItem.quantity;

        restockUpdates.push({
          updateOne: {
            filter: {
              _id: originalItem.product._id,
              'variants.sku': originalVariant.sku,
            },
            update: { $inc: { 'variants.$.quantity': -originalItem.quantity } },
          },
        });

        if (originalVariant.relatedSku && originalVariant.relatedSku.length > 0) {
          for (const related of originalVariant.relatedSku) {
            const relatedProduct = await Product.findOne({
              'variants.sku': related.sku,
            });
            if (relatedProduct) {
              const relatedVariantData = relatedProduct.variants.find(
                (v) => v.sku === related.sku
              );
              if (relatedVariantData) {
                const quantityToReduce =
                  related.quantity * originalItem.quantity;
                if (relatedVariantData.quantity < quantityToReduce) {
                  console.warn(
                    `Insufficient quantity for related SKU: ${related.sku} in product ${relatedProduct._id}. Available: ${relatedVariantData.quantity}, Required: ${quantityToReduce}`
                  );
                } else {
                  restockUpdates.push({
                    updateOne: {
                      filter: {
                        _id: relatedProduct._id,
                        'variants.sku': related.sku,
                      },
                      update: {
                        $inc: { 'variants.$.quantity': -quantityToReduce },
                      },
                    },
                  });
                }
              }
            }
          }
        }
      }
    }

    let shippingCharges = 100;
    let codAmount;
    let totalAmount;

    if (newOrderAmount < 1000) {
      if (
        orderDataForNewOrder.orderType.toLowerCase() === 'cod' &&
        (orderDataForNewOrder.advanceDiposite === undefined ||
          orderDataForNewOrder.advanceDiposite <= 0)
      ) {
        totalAmount = newOrderAmount + shippingCharges;
        codAmount = totalAmount;
      } else if (
        orderDataForNewOrder.orderType.toLowerCase() === 'cod' &&
        orderDataForNewOrder.advanceDiposite > 0
      ) {
        totalAmount = newOrderAmount + shippingCharges;
        codAmount = totalAmount - orderDataForNewOrder.advanceDiposite;
      } else if (
        orderDataForNewOrder.orderType.toLowerCase() === 'prepaid'
      ) {
        totalAmount = newOrderAmount + shippingCharges;
        codAmount = 0;
      }
    } else {
      shippingCharges = 0;
      if (
        orderDataForNewOrder.orderType.toLowerCase() === 'cod' &&
        (orderDataForNewOrder.advanceDiposite === undefined ||
          orderDataForNewOrder.advanceDiposite <= 0)
      ) {
        totalAmount = newOrderAmount;
        codAmount = totalAmount;
      } else if (
        orderDataForNewOrder.orderType.toLowerCase() === 'cod' &&
        orderDataForNewOrder.advanceDiposite > 0
      ) {
        totalAmount = newOrderAmount;
        codAmount = totalAmount - orderDataForNewOrder.advanceDiposite;
      } else if (
        orderDataForNewOrder.orderType.toLowerCase() === 'prepaid'
      ) {
        totalAmount = newOrderAmount;
        codAmount = 0;
      }
    }

    const newOrder = new Order({
      ...orderDataForNewOrder,
      orderId: `REPLACEMENT-${originalOrder.orderId}`,
      orderItems: newOrderItems,
      shippingCharges,
      codAmount,
      amount: newOrderAmount,
      totalAmount,
      replacedOrder: originalOrder._id,
    });

    const [savedNewOrder] = await Promise.all([
      newOrder.save(),
      Product.bulkWrite(restockUpdates),
      Order.updateOne(
        { _id: originalOrder._id },
        { status: 'replaced' }
      ),
    ]);

    const populatedSavedOrder = await Order.findById(
      savedNewOrder._id
    ).populate('orderItems.product');

    res.status(201).json({
      message: 'Replacement order created successfully',
      order: populatedSavedOrder,
      success: true,
    });
  } catch (error) {
    console.error('Error creating replacement order:', error);
    res.status(500).json({
      message: 'Server error while creating replacement order',
      error: error.message,
    });
  }
};


module.exports = {
  getAmazonOrderItem,
  getAllAmazonOrders,
  getAllShopifyOrders,
  getShopifyOrderItem,
  createAppOrder,
  getAppOrders,
  updateAppOrderManifest,
  updateAppOrderIntransit,
  getAppOrderById,
  updateAppOrderDelivered,
  updateAppOrderDispatch,
  cancelAppOrder,
  cancelAppOrderWithStatus,
  createReplacementOrder
};
