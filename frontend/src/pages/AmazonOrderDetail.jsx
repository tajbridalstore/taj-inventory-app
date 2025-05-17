import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getSingleAmazonOrderItem } from "@/services/api";

const AnazonOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null); // Use a single 'order' state
  const [loading, setLoading] = useState(false); // Use 'loading'
  const [error, setError] = useState(null);   // Use 'error'

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getSingleAmazonOrderItem(orderId);
        console.log("Fetched order details:", response);

        if (response?.success) {
          setOrder(response.data); // Store the entire data object
        } else {
          setError("Failed to fetch order details");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError("Error fetching order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return <div className="p-6 text-center">Loading order details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="p-6 text-center">Order details not found.</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-indigo-500 text-white py-4 px-6">
          <h2 className="text-2xl font-semibold">Order Details for Order ID: {orderId}</h2>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Order Information</h3>
            <p>
              <strong>Amazon Order ID:</strong> {order.AmazonOrderId}
            </p>
            <p>
              <strong>Purchase Date:</strong> {order.PurchaseDate}
            </p>
            <p>
              <strong>Order Status:</strong> {order.OrderStatus}
            </p>
          </div>

          {order.ShippingAddress && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>City:</strong> <p className="text-gray-700">{order.ShippingAddress.City}</p></div>
                <div><strong>Country Code:</strong> <p className="text-gray-700">{order.ShippingAddress.CountryCode}</p></div>
                <div><strong>Postal Code:</strong> <p className="text-gray-700">{order.ShippingAddress.PostalCode}</p></div>
                <div><strong>State/Region:</strong> <p className="text-gray-700">{order.ShippingAddress.StateOrRegion}</p></div>
              </div>
            </div>
          )}

          <h3 className="text-xl font-semibold mb-4">Order Items</h3>
          {order.OrderItems && order.OrderItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
              {order.OrderItems.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-md border border-gray-200 p-4 mb-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.Title || "Product Image"}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <p className="font-semibold text-lg text-indigo-600">{item.Title || 'N/A'}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div><strong>ASIN:</strong> <p className="text-gray-700">{item.ASIN || 'N/A'}</p></div>
                    <div><strong>SKU:</strong> <p className="text-gray-700">{item.SellerSKU || 'N/A'}</p></div>
                    <div><strong>Quantity:</strong> <p className="text-gray-700">{item.QuantityOrdered || 'N/A'}</p></div>
                  </div>
                  <p className="mt-2"><strong>Unit Price:</strong> ₹{item.ItemPrice?.Amount || 0}</p>
                  <p className="font-bold text-green-600 mt-2">
                    Total: ₹{(parseFloat(item.ItemPrice?.Amount || 0) * item.QuantityOrdered).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No items found in this order.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnazonOrderDetail;
