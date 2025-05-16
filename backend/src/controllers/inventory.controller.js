const axios = require("axios");
const getAccessToken = require("../utils/genarateToken");

const getShopifyProductsInventory = async (req, res) => {
  try {
    const allInventoryData = [];

    // Step 1: Get all location IDs
    const locationsResponse = await axios.get(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/locations.json`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const locations = locationsResponse.data.locations;
    if (!locations || locations.length === 0) {
      console.warn("No locations found in Shopify store.");
      return res.status(200).json({ success: true, allInventoryData });
    }
    const locationIds = locations.map((location) => location.id);



    // Step 2: Fetch all products (with pagination)
    let allProducts = [];
    let productUrl = `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/products.json?limit=250`;
    let hasMoreProducts = true;

    const fetchProducts = async (url) => {
      const response = await axios.get(url, {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      });
      const products = response.data.products;
      const nextUrl = response.headers.link?.match(/<([^>]+)>; rel="next"/)?.[1];
      return { products, nextUrl };
    };

    while (hasMoreProducts) {
      const { products: productPage, nextUrl } = await fetchProducts(productUrl);
      allProducts = [...allProducts, ...productPage];

      if (nextUrl) {
        productUrl = nextUrl;
      } else {
        hasMoreProducts = false;
      }
    }



    // Step 3: Collect all variant inventory_item_ids
    const allVariantIds = [];
    for (const product of allProducts) {
      for (const variant of product.variants) {
        if (variant.inventory_item_id) {
          allVariantIds.push(variant.inventory_item_id);
        }
      }
    }

 

    // Step 4: Fetch inventory levels in batches
    const variantInventoryMap = {}; // { inventory_item_id: inventory_level }
    const chunkSize = 100;

    for (let i = 0; i < allVariantIds.length; i += chunkSize) {
      const chunk = allVariantIds.slice(i, i + chunkSize);

      const inventoryLevelsResponse = await axios.get(
        `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/inventory_levels.json`,
        {
          params: {
            inventory_item_ids: chunk.join(","),
            location_ids: locationIds.join(","),
          },
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      const inventoryLevels = inventoryLevelsResponse.data.inventory_levels;

      for (const inventory of inventoryLevels) {
        variantInventoryMap[inventory.inventory_item_id] = inventory;
      }

      // Optional: Small delay between batches to avoid Shopify 429 error
      await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms
    }



    // Step 5: Assemble final data
    for (const product of allProducts) {
      const productData = {
        id: product.id,
        title: product.title,
        variants: [],
      };

      for (const variant of product.variants) {
        const variantData = {
          id: variant.id,
          sku: variant.sku,
          title: variant.title,
          inventory_level: variantInventoryMap[variant.inventory_item_id] || null,
        };
        productData.variants.push(variantData);
      }

      allInventoryData.push(productData);
    }



    return res.status(200).json({ success: true, allInventoryData });

  } catch (error) {
    console.error("❌ Failed to retrieve product inventory:", error.response?.data || error.message);
    if (error.response?.status === 429) {
      return res.status(429).json({ success: false, message: "Shopify Rate Limit Exceeded" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Function to check the status of the report
const checkReportStatus = async (reportId, accessToken) => {
  try {
    const response = await axios.get(
      `https://sellingpartnerapi-eu.amazon.com/reports/2021-06-30/reports/${reportId}`,
      {
        headers: {
          "x-amz-access-token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Report Status Response:", response.data);  // Log full response
    return response.data;
  } catch (error) {
    console.error("Error checking report status:", error.response?.data || error.message);
    throw error;
  }
};
// Function to download the report data once it's ready
const downloadReport = async (reportId, accessToken) => {
  try {
    const response = await axios.get(
      `https://sellingpartnerapi-eu.amazon.com/reports/2021-06-30/reports/${reportId}/document`,
      {
        headers: {
          "x-amz-access-token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error downloading report:", error.response?.data || error.message);
    throw error;
  }
};

const getAmazonInventory = async (req, res) => {
  const accessToken = await getAccessToken();

  try {
    // Step 1: Create the report
    const createReportResponse = await axios.post(
      "https://sellingpartnerapi-eu.amazon.com/reports/2021-06-30/reports",
      {
        reportType: "GET_MERCHANT_LISTINGS_ALL_DATA", // Correct report type
        marketplaceIds: ["A21TJRUUN4KGV"], // Ensure this is correct for your marketplace
      },
      {
        headers: {
          "x-amz-access-token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

  
    const reportId = createReportResponse.data.reportId;

    // Step 2: Check the status of the report
    let reportStatus = await checkReportStatus(reportId, accessToken);

    // Polling for report status until it's done
    while (reportStatus.reportProcessingStatus === 'PENDING' || reportStatus.reportProcessingStatus === 'IN_PROGRESS') {
      console.log("Report still processing, waiting...");
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
      reportStatus = await checkReportStatus(reportId, accessToken);
    }

    // If report is done, download the data
    if (reportStatus.reportProcessingStatus === 'DONE') {
      const reportData = await downloadReport(reportId, accessToken);
 
      return res.json({ success: true, data: reportData });
    } else {
      console.error("Report failed:", reportStatus.reportProcessingStatus);
      return res.status(500).json({ error: "Report failed to process" });
    }

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to create or retrieve inventory report" });
  }
};


module.exports = { getShopifyProductsInventory,getAmazonInventory };
