import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSingleShopifyOrderItem } from "@/services/api";

const ShopifyOrderDetail = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [errorItem, setErrorItem] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoadingItem(true);
      setErrorItem(null);

      try {
        const response = await getSingleShopifyOrderItem(orderId);
        console.log("Fetched Shopify Order:", response);

        if (response?.success) {
          setOrder(response.data);
        } else {
          setErrorItem("Order not found");
        }
      } catch (error) {
        console.error("Error fetching Shopify order:", error);
        setErrorItem("Error fetching Shopify order");
      } finally {
        setLoadingItem(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Order Details for Order ID: {orderId}
      </h2>

      {loadingItem && <p>Loading order details...</p>}
      {errorItem && <p className="text-red-500">{errorItem}</p>}

      {!loadingItem && order && order?.line_items?.length > 0 && (
        <Table className="w-full bg-blue-50 rounded-2xl p-4">
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Id</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.line_items.map((lineItem) => (
              <TableRow key={lineItem.id}>
                <TableCell>
                  {lineItem.images && lineItem.images.length > 0 ? (
                    <img
                      src={lineItem.images[1]?.src}
                      alt={lineItem.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    "No Image"
                  )}
                </TableCell>
                <TableCell>{order.name || "N/A"}</TableCell>
                <TableCell className="font-semibold">{lineItem.name}</TableCell>
                <TableCell>{lineItem.variant_title || "N/A"}</TableCell>
                <TableCell>{lineItem.quantity}</TableCell>
                <TableCell>₹{lineItem.price}</TableCell>
                <TableCell className="font-bold text-green-600">₹{order.total_price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loadingItem && order && (!order.line_items || order.line_items.length === 0) && (
        <p>No items found in this order.</p>
      )}

      {!loadingItem && !order && !errorItem && (
        <p>Order details not found.</p>
      )}
    </div>
  );
};

export default ShopifyOrderDetail;
