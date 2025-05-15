import { BASE_URL } from "@/services/api";
import {
  fetchAmazonOrders,
  fetchAmazonPendingOrders,
  fetchAmazonTotalOrders,
  setError,
  setLoading,
} from "@/store/orderSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const useGetAmazonOrders = () => {
  const [amazonOrders, setAmazonOrders] = useState([]);
  const [amazonPendingOrders, setAmazonPendingOrders] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        dispatch(setLoading(true));

        const lastFetched = localStorage.getItem("amazonLastFetchedOrdersTime");
        const now = Date.now();

        // Clear cache if data is older than 1 hour
        if (!lastFetched || now - parseInt(lastFetched) >= 3600000) {
          localStorage.removeItem("cachedAmazonOrders");
          localStorage.removeItem("cachedAmazonTotalOrders");
          localStorage.removeItem("amazonLastFetchedOrdersTime");
        }

        const cachedOrders = JSON.parse(localStorage.getItem("cachedAmazonOrders"));
        const cachedTotalOrders = localStorage.getItem("cachedAmazonTotalOrders");

        if (cachedOrders && cachedTotalOrders) {
          const pending = cachedOrders.filter(order =>
            order.OrderStatus === "Pending" ||
            order.OrderStatus === "Unshipped" ||
            order.EasyShipShipmentStatus === "PendingPickUp"
          );

        
          setAmazonOrders(cachedOrders);
          setAmazonPendingOrders(pending);
          dispatch(fetchAmazonOrders(cachedOrders));
          dispatch(fetchAmazonPendingOrders(pending));
          dispatch(fetchAmazonTotalOrders(Number(cachedTotalOrders)));
        } else {
          // Fetch from server if no cache
          const response = await axios.get(`${BASE_URL}/api/v1/order/get-amazon-orders`);
  

          if (response.data.success) {
            const sortedOrders = response.data.data.sort(
              (a, b) => new Date(b.PurchaseDate) - new Date(a.PurchaseDate)
            );

            const pending = sortedOrders.filter(order =>
              (order.OrderStatus === "Pending" ||
               order.OrderStatus === "Unshipped" ||
               order.EasyShipShipmentStatus === "PendingPickUp") &&
              new Date(order.PurchaseDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            );

            localStorage.setItem("cachedAmazonOrders", JSON.stringify(sortedOrders));
            localStorage.setItem("cachedAmazonTotalOrders", response.data.count);
            localStorage.setItem("amazonLastFetchedOrdersTime", now.toString());

            setAmazonOrders(sortedOrders);
            setAmazonPendingOrders(pending);
            dispatch(fetchAmazonOrders(sortedOrders));
            dispatch(fetchAmazonPendingOrders(pending));
            dispatch(fetchAmazonTotalOrders(response.data.count));
          } else {
            dispatch(setError("No orders found"));
          }
        }
      } catch (err) {
        dispatch(setError(err.message || "Error fetching orders"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchOrders();
  }, [dispatch]);

  return { amazonOrders, amazonPendingOrders };
};

export default useGetAmazonOrders;
