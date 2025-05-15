// useGetShopifyOrders.js

import { BASE_URL } from "@/services/api";
import {
  fetchShopifyTotalOrders,
  setShopifyLoading,
  setShopifyError,
  fetchShopifyPendingOrders,
} from "@/store/orderSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetShopifyOrders = () => {
  const dispatch = useDispatch();

  useEffect(() => {
 
    const fetchAllShopifyOrders = async () => {
      dispatch(setShopifyLoading(true)); // Dispatch loading to Redux

      const lastFetched = localStorage.getItem("cachedShopifyOrdersTime");
      const now = Date.now();
      const cacheExpirationTime = 3600000; // 1 hour

      if (!lastFetched || now - parseInt(lastFetched) >= cacheExpirationTime) {
        localStorage.removeItem("cachedTotalShopifyOrders");
        localStorage.removeItem("cachedShopifyPendingOrders");
        localStorage.removeItem("cachedShopifyOrdersTime");
      }

      const cachedOrders = JSON.parse(
        localStorage.getItem("cachedTotalShopifyOrders")
      );
      const cachedPendingOrders = JSON.parse(
        localStorage.getItem("cachedShopifyPendingOrders")
      );
      if (cachedOrders) {
        dispatch(fetchShopifyTotalOrders(cachedOrders));
        dispatch(fetchShopifyPendingOrders(cachedPendingOrders))
        dispatch(setShopifyLoading(false));

        return;
      }

      try {
       
        const response = await axios.get(
          `${BASE_URL}/api/v1/order/get-shopify-orders`
        );

        if (
          response.status >= 200 &&
          response.status < 300 &&
          response.data?.success
        ) {
          const allOrders = response.data.data;

          // Filter pending orders
          const pendingOrders = allOrders.filter(
            (order) => order.financial_status === "pending"
          );
        
          // Store in localStorage if needed
          localStorage.setItem("cachedTotalShopifyOrders", JSON.stringify(allOrders));
          localStorage.setItem("cachedShopifyPendingOrders", JSON.stringify(pendingOrders));
          localStorage.setItem("cachedShopifyOrdersTime", now.toString());
        
          // Dispatch both total and pending orders
          dispatch(fetchShopifyTotalOrders(allOrders));
          dispatch(fetchShopifyPendingOrders(pendingOrders));
        } else {
          console.error(
            "useGetShopifyOrders - Error fetching orders:",
            response.data?.message || response.statusText
          );

          dispatch(
            setShopifyError(
              response.data?.message ||
                response.statusText ||
                "Failed to fetch Shopify orders"
            )
          );
        }
      } catch (error) {
        console.error("useGetShopifyOrders - Error fetching orders:", error);

        dispatch(
          setShopifyError(error.message || "An unexpected error occurred")
        );
      } finally {
        dispatch(setShopifyLoading(false));
      }
    };

    fetchAllShopifyOrders();
  }, [dispatch]);
};

export default useGetShopifyOrders;
