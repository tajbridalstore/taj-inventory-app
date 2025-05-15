const axios = require("axios");
const SHOPIFY_ORDER_API = process.env.SHOPIFY_ORDER_API;

const fetchAllShopifyOrders = async (accessToken) => {
  const baseUrl = `${SHOPIFY_ORDER_API}.json?status=any`;
  let allOrders = [];
  let nextLink = null;

  // ✅ Get last 30 days date range
  const now = new Date();
  const past30Days = new Date();
  past30Days.setDate(now.getDate() - 30);

  const createdAtMin = past30Days.toISOString();
  const createdAtMax = now.toISOString();

  try {
    let url = baseUrl;
    const initialParams = {
      created_at_min: createdAtMin,
      created_at_max: createdAtMax,
      limit: 50,
    };

    let firstPage = true;

    do {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        params: firstPage ? initialParams : {},
      });

      if (response.data && Array.isArray(response.data.orders)) {
        allOrders.push(...response.data.orders);
      }

      const linkHeader = response.headers.link;
      nextLink = null;
      if (linkHeader) {
        const links = linkHeader.split(", ");
        const nextLinkObject = links.find((link) => link.includes('rel="next"'));
        if (nextLinkObject) {
          const match = nextLinkObject.match(/<(.*?)>/);
          if (match && match[1]) {
            nextLink = match[1];
            url = nextLink;
          }
        }
      }

      firstPage = false;
    } while (nextLink);

    return allOrders;
  } catch (error) {
    console.error("Error fetching Shopify orders:", error.response ? error.response.data : error.message);
    return [];
  }
};


module.exports = { fetchAllShopifyOrders };
