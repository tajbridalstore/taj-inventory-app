const axios = require("axios");
const ORDER_API = process.env.ORDER_API;



const fetchAllAmazonOrders = async (
  accessToken,
  marketplaceIds = ["A21TJRUUN4KGV"],
  limit = null // Optional limit parameter
) => {
  const baseUrl = `${ORDER_API}`;
  let allOrders = [];
  let nextToken = null;
  let firstCall = true;
  let ordersFetched = 0;

  // ✅ Calculate last 30 days
  const now = new Date();
  const past30Days = new Date();
  past30Days.setDate(now.getDate() - 30);
  const createdAfter = past30Days.toISOString(); // ISO 8601 format

  try {
    do {
      const url = baseUrl;
      const params = firstCall
        ? {
            MarketplaceIds: marketplaceIds.join(','),
            CreatedAfter: createdAfter,
            ...(limit !== null && { MaxResultsPerPage: Math.min(limit - ordersFetched, 100) }),
          }
        : { NextToken: nextToken };

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "x-amz-access-token": accessToken,
        },
        params,
      });

      if (response.status !== 200) {
        console.error(`Amazon API Error ${response.status}:`, response.data);
        throw new Error(`Amazon API request failed with status ${response.status}`);
      }

      const payload = response.data.payload || {};
      if (payload.Orders && Array.isArray(payload.Orders)) {
        const newOrders = payload.Orders;
        allOrders.push(...newOrders);
        ordersFetched += newOrders.length;

        if (limit !== null && ordersFetched >= limit) {
          break;
        }
      }

      nextToken = payload.NextToken || null;
      firstCall = false;

      if (nextToken) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Optional delay to avoid throttling
      }
    } while (nextToken && (limit === null || ordersFetched < limit));

    return allOrders;
  } catch (error) {
    console.error("Error fetching Amazon orders:", error.message);
    throw error;
  }
};



module.exports = { fetchAllAmazonOrders };
