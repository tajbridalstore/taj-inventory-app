// useGetShopifyOrders.js

import { fetchAppOrder } from "@/services/api";
import {
  setShopifyError,
  setLoading,
  fetchTotalOrders,
  fetchPendingOrders,
  setError,
} from "@/store/orderSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetOrders = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrders = async () => {
      dispatch(setLoading(true)); // Dispatch loading to Redux

      try {
        const response = await fetchAppOrder();
        console.log(response);
        if (response.success) {
          const allOrders = response.orders;

          // Filter pending orders and ensure uniqueness
          const pendingOrders = [];
          const uniquePendingOrderIds = new Set();
          allOrders.forEach((order) => {
            if (order.status === "pending" && !uniquePendingOrderIds.has(order._id)) {
              pendingOrders.push(order);
              uniquePendingOrderIds.add(order._id);
            }
          });

          dispatch(fetchTotalOrders(allOrders));
          dispatch(fetchPendingOrders(pendingOrders));
        } else {
          console.error(
            "useGetOrders - Error fetching orders:",
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

        dispatch(setError(error.message || "An unexpected error occurred"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchOrders();
    // **Empty dependency array ensures this runs only once on mount**
  }, []); // <-- Corrected dependency array
};

export default useGetOrders;