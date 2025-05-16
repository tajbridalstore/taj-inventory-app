require("dotenv").config();
const axios = require("axios");
const getAccessToken = require("../utils/genarateToken");
const { staticFeedData } = require("../utils/feedData");
const Product = require("../models/product.model");
const zlib = require("zlib");
const marketplaceIds = ["A21TJRUUN4KGV"]; // India
const region = "https://sellingpartnerapi-eu.amazon.com";
const NodeCache = require("node-cache");
const PAGE_SIZE = 10; // Consistent page size
const cache = new NodeCache({ stdTTL: 60 * 60 });
// === Helpers ===
const getHeaders = (accessToken) => ({
  "Content-Type": "application/json",
  "x-amz-access-token": accessToken,
});
// === Step 1: Create Feed Document ===
async function createFeedDocument(accessToken) {
  const res = await axios.post(
    `${region}/feeds/2021-06-30/documents`,
    { contentType: "application/json" },
    { headers: getHeaders(accessToken) }
  );
  return res.data;
}
// === Step 2: Upload Feed File to Pre-signed URL ===
async function uploadFeedToS3(preSignedUrl, jsonFeed) {
  await axios.put(preSignedUrl, JSON.stringify(jsonFeed), {
    headers: { "Content-Type": "application/json" },
  });
}
// === Step 3: Create Feed ===
async function createFeed(accessToken, feedDocumentId) {
  const body = {
    feedType: "JSON_LISTINGS_FEED",
    marketplaceIds: marketplaceIds,
    inputFeedDocumentId: feedDocumentId,
  };

  const res = await axios.post(`${region}/feeds/2021-06-30/feeds`, body, {
    headers: getHeaders(accessToken),
  });

  return res.data;
}
const createFeedProduct = async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    const { sku } = req.body;

    // Get the parent product
    const parentProduct = await Product.findOne({ sku });

    if (!parentProduct) {
      return res.status(404).json({ error: "Parent product not found." });
    }

    // 🔨 Build dynamic feedData
    const messages = [];
    let messageId = 1;
    // Parent message
    messages.push({
      messageId: messageId++,
      sku: parentProduct.sku,
      operationType: "UPDATE",
      productType: "BRACELET",
      requirements: "LISTING",
      attributes: {
        ...staticFeedData,
        item_name: parentProduct.item_name,
        product_description: parentProduct.product_description,
        part_number: parentProduct.part_number,
        parentage_level: [
          {
            marketplace_id: "A21TJRUUN4KGV",
            value: "parent",
          },
        ],
        metal_type: parentProduct.metal_type,
        material: parentProduct.material,
        metals: parentProduct.metals,
        bullet_point: parentProduct.bullet_point,
        generic_keyword: parentProduct.generic_keyword,
        item_length: parentProduct.item_length,
        item_weight: parentProduct.item_weight,
        item_type_name: parentProduct.item_type_name,
        clasp_type: parentProduct.clasp_type,
        main_product_image_locator: parentProduct.main_product_image_locator,
        other_product_image_locator_2:
          parentProduct.other_product_image_locator_2,
        other_product_image_locator_3:
          parentProduct.other_product_image_locator_3,
        other_product_image_locator_4:
          parentProduct.other_product_image_locator_4,
        other_product_image_locator_5:
          parentProduct.other_product_image_locator_5,
      },
    });

    // Variant messages
    parentProduct.variants.forEach((variant, index) => {
      messages.push({
        messageId: messageId++,
        sku: variant.sku,
        operationType: "UPDATE",
        productType: "BRACELET",
        requirements: "LISTING",
        attributes: {
          ...staticFeedData,
          item_name: parentProduct.item_name,
          product_description: parentProduct.product_description,
          metal_type: parentProduct.metal_type,
          material: parentProduct.material,
          metals: parentProduct.metals,
          bullet_point: parentProduct.bullet_point,
          generic_keyword: parentProduct.generic_keyword,
          item_length: parentProduct.item_length,
          item_weight: parentProduct.item_weight,
          item_type_name: parentProduct.item_type_name,
          clasp_type: parentProduct.clasp_type,
          ////////////////////////////////////////////////////////////////////
          purchasable_offer: variant.purchasable_offer,
          fulfillment_availability: variant.fulfillment_availability,
          part_number: variant.part_number,
          parentage_level: [
            {
              marketplace_id: "A21TJRUUN4KGV",
              value: "child",
            },
          ],
          size: variant.size,
          color: variant.color,
          style: variant.style,
          child_parent_sku_relationship: variant.child_parent_sku_relationship,
          main_product_image_locator: variant.main_product_image_locator,
          other_product_image_locator_1: variant.other_product_image_locator_1,
          other_product_image_locator_2: variant.other_product_image_locator_2,
          other_product_image_locator_3: variant.other_product_image_locator_3,
          other_product_image_locator_4: variant.other_product_image_locator_4,
          other_product_image_locator_5: variant.other_product_image_locator_5,
        },
      });
    });

    const feedData = {
      header: {
        sellerId: "A161B89WYTIEK8", // your seller ID
        version: "2.0",
        issueLocale: "en_IN",
      },
      messages,
    };

    // 🛠 Amazon Feed Flow
    if (!accessToken || !feedData) {
      return res
        .status(400)
        .json({ error: "Missing accessToken or feedData." });
    }

    const { feedDocumentId, url } = await createFeedDocument(accessToken);
    await uploadFeedToS3(url, feedData);
    const feedResponse = await createFeed(accessToken, feedDocumentId);
    return res.json({
      success: true,
      message: "Feed uploaded and submitted successfully.",
      feedId: feedResponse.feedId,
    });
  } catch (err) {
    console.error("Error uploading feed:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
};

async function getFeedStatus(accessToken, feedId) {

  const res = await axios.get(`${region}/feeds/2021-06-30/feeds/${feedId}`, {
    headers: getHeaders(accessToken),
  });
 
  return res.data;
}

async function getFeedResultDocument(accessToken, resultFeedDocumentId) {
  const res = await axios.get(
    `${region}/feeds/2021-06-30/documents/${resultFeedDocumentId}`,
    { headers: getHeaders(accessToken) }
  );

  return res.data; // contains a pre-signed URL
}

async function downloadResultFile(url) {
  const res = await axios.get(url, {
    responseType: "arraybuffer", // Important to get buffer
  });

  const buffer = Buffer.from(res.data);

  try {
    const decompressed = zlib.gunzipSync(buffer).toString("utf-8");
    return decompressed;
  } catch (error) {
    // If not gzip compressed, return plain buffer text
    return buffer.toString("utf-8");
  }
}

const checkFeedStatus = async (req, res) => {
  try {
    const { accessToken, feedId } = req.body;

    const feedInfo = await getFeedStatus(accessToken, feedId);
    const status = feedInfo.processingStatus;

    if (status === "DONE") {
      const resultFeedDocumentId = feedInfo.resultFeedDocumentId;
      const { url } = await getFeedResultDocument(
        accessToken,
        resultFeedDocumentId
      );
      const resultData = await downloadResultFile(url);
      console.log("resultData", resultData);
      return res.json({
        message: "Feed processed successfully.",
        status,
        report: resultData,
      });
    } else {
      return res.json({ message: "Feed still processing.", status });
    }
  } catch (err) {
    console.error(
      "Error checking feed status:",
      err?.response?.data || err.message
    );
    res.status(500).json({ error: err?.response?.data || err.message });
  }
};

const getAllListedProducts = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    console.log("accessToken", accessToken);
    const sellerId = process.env.SELLER_ID; // make sure you have sellerId saved in .
    console.log("sellerId", sellerId);
    const marketplaceId = "A21TJRUUN4KGV"; // India

    const url = `https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/${sellerId}?limit=200`;

    const response = await axios.get(url, {
      headers: {
        "x-amz-access-token": accessToken,
        "Content-Type": "application/json",
      },
      params: {
        marketplaceIds: marketplaceId,
        includedData: "summaries,fulfillmentAvailability",
      },
    });
    console.log("Amazon API Response:", response.data);
    const products = response.data.items;

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(
      "Error fetching products:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};



module.exports = { createFeedProduct, checkFeedStatus, getAllListedProducts };
