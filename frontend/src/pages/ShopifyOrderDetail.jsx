import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
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

  if (loadingItem) {
    return <div className="p-6 text-center">Loading order details...</div>;
  }

  if (errorItem) {
    return <div className="p-6 text-center text-red-500">{errorItem}</div>;
  }

  if (!order) {
    return <div className="p-6 text-center">Order not found.</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-indigo-500 text-white py-4 px-6">
          <h2 className="text-2xl font-semibold">Order #{order?.name || 'N/A'}</h2>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><strong>Order Number:</strong> <p className="text-gray-700">{order?.name || 'N/A'}</p></div>
            {order?.shipping_address?.name && <div><strong>Name:</strong> <p className="text-gray-700">{order.shipping_address.name || 'N/A'}</p></div>}
            {order?.shipping_address?.phone && <div><strong>Phone:</strong> <p className="text-gray-700">{order.shipping_address.phone || 'N/A'}</p></div>}
            {order?.shipping_address?.city && <div><strong>City:</strong> <p className="text-gray-700">{order.shipping_address.city || 'N/A'}</p></div>}
            {order?.shipping_address?.address1 && <div><strong>Address 1:</strong> <p className="text-gray-700">{order.shipping_address.address1 || 'N/A'}</p></div>}
            {order?.shipping_address?.address2 && <div><strong>Address 2:</strong> <p className="text-gray-700">{order.shipping_address.address2 || 'N/A'}</p></div>}
            {order?.shipping_address?.country && <div><strong>Country:</strong> <p className="text-gray-700">{order.shipping_address.country || 'N/A'}</p></div>}
            {order?.shipping_address?.zip && <div><strong>Zip Code:</strong> <p className="text-gray-700">{order.shipping_address.zip || 'N/A'}</p></div>}
            {order?.shipping_address?.province && <div><strong>Province:</strong> <p className="text-gray-700">{order.shipping_address.province || 'N/A'}</p></div>}
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">Order Items</h3>
          {order?.line_items?.map((lineItem, index) => (
            <div key={lineItem.id} className="bg-gray-50 rounded-md border border-gray-200 p-4 mb-4">
              <p className="font-semibold text-lg text-indigo-600">{lineItem.name || 'Product Title Not Available'}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div><strong>ID:</strong> <p className="text-gray-700">{order?.name || 'N/A'}</p></div>
                <div><strong>SKU:</strong> <p className="text-gray-700">{lineItem.sku || 'N/A'}</p></div>
                <div><strong>Quantity:</strong> <p className="text-gray-700">{lineItem.quantity || 'N/A'}</p></div>
                {/* You might not have a direct 'status' for each line item from Shopify */}
              </div>

              {lineItem?.images && lineItem.images.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-700">Images:</h4>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {lineItem.images.map((image, imageIndex) => (
                      <div key={image.id} className="bg-white rounded-md border border-gray-300 p-2 flex items-center space-x-2">
                        <img
                          src={image.src}
                          alt={lineItem.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lineItem?.variant_title && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Variant: {lineItem.variant_title}</p>
                </div>
              )}
              <p className="mt-2"><strong>Unit Price:</strong> ₹{lineItem.price}</p>
              <p className="font-bold text-green-600 mt-2">Total: ₹{(parseFloat(lineItem.price) * lineItem.quantity).toFixed(2)}</p>
            </div>
          ))}

          <div className="mt-6 border-t pt-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><strong>Total Price:</strong> <p className="text-green-600 font-semibold">₹{order?.total_price || 'N/A'}</p></div>
              {/* Add other summary details if available in your Shopify order data */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopifyOrderDetail;