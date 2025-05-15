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
import { getSingleAmazonOrderItem } from "@/services/api"; // 🔥 We'll create this API function too

const AnazonOrderDetail = () => {
  const { orderId } = useParams();

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [errorItems, setErrorItems] = useState(null);

  useEffect(() => {
    const fetchOrderItems = async () => {
      setLoadingItems(true);
      setErrorItems(null);

      try {
        const response = await getSingleAmazonOrderItem(orderId);
        console.log("Fetched order items:", response);

        if (response?.success) {
          setItems(response?.data?.OrderItems || []);
        } else {
          setErrorItems("Failed to fetch order items");
        }
      } catch (error) {
        console.error("Error fetching order items:", error);
        setErrorItems("Error fetching order items");
      } finally {
        setLoadingItems(false);
      }
    };

    if (orderId) {
      fetchOrderItems();
    }
  }, [orderId]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Order Items for Order ID: {orderId}
      </h2>

      {loadingItems && <p>Loading...</p>}
      {errorItems && <p className="text-red-500">{errorItems}</p>}

      {!loadingItems && items.length > 0 && (
        <Table className="w-full h-full table-fixed bg-blue-50 rounded-2xl p-4">
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>ASIN</TableHead>
              <TableHead>Seller SKU</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.Title || "Product image"}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>{item.ASIN}</TableCell>
                <TableCell>{item.SellerSKU}</TableCell>
                <TableCell>{item.QuantityOrdered}</TableCell>
                <TableCell>₹{item.ItemPrice?.Amount ?? "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loadingItems && items.length === 0 && (
        <p>No order items found for this order.</p>
      )}
    </div>
  );
};

export default AnazonOrderDetail;
