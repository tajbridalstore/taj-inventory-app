// Frontend (OrderDetails component)

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { BASE_URL } from '@/services/api'; // Adjust your API import

const OrderDetails = () => {
  const { orderId } = useParams(); // Rename 'id' to 'orderId' for clarity
  const [orderDetails, setOrderDetails] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/order/get-app-order/${orderId}`); // Use the correct API endpoint
        setOrderDetails(response.data.order); // Assuming your backend returns { success: true, order: { ... } }
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div className="p-6 text-center">Loading order details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!orderDetails) {
    return <div className="p-6 text-center">Order not found.</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-indigo-500 text-white py-4 px-6">
          <h2 className="text-2xl font-semibold">Order #{orderDetails?.orderId || 'N/A'}</h2>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><strong>Name:</strong> <p className="text-gray-700">{orderDetails?.name || 'N/A'}</p></div>
            <div><strong>Mobile:</strong> <p className="text-gray-700">{orderDetails?.mobile?.[0]?.number || 'N/A'}</p></div>
            <div><strong>City:</strong> <p className="text-gray-700">{orderDetails?.city || 'N/A'}</p></div>
            <div><strong>Address:</strong> <p className="text-gray-700">{orderDetails?.address || 'N/A'}</p></div>
            <div><strong>Country:</strong> <p className="text-gray-700">{orderDetails?.country || 'N/A'}</p></div>
            <div><strong>Pin Code:</strong> <p className="text-gray-700">{orderDetails?.pinCode || 'N/A'}</p></div>
            <div><strong>Order Date:</strong> <p className="text-gray-700">{new Date(orderDetails?.orderDate).toLocaleDateString() || 'N/A'}</p></div>
            <div><strong>Order From:</strong> <p className="text-gray-700">{orderDetails?.orderFrom || 'N/A'}</p></div>
            <div><strong>Order Type:</strong> <p className="text-gray-700">{orderDetails?.orderType || 'N/A'}</p></div>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">Order Items</h3>
          {orderDetails?.orderItems?.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-md border border-gray-200 p-4 mb-4">
              <p className="font-semibold text-lg text-indigo-600">{item.product?.productTitle || 'Product Title Not Available'}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div><strong>SKU:</strong> <p className="text-gray-700">{item.product?.sku || 'N/A'}</p></div>
                <div><strong>Quantity:</strong> <p className="text-gray-700">{item.quantity || 'N/A'}</p></div>
                <div><strong>Status:</strong> <p className="text-gray-700">{item.status || 'N/A'}</p></div>
              </div>

              {item.product?.variants && item.product.variants.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-700">Variants:</h4>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {item.product.variants.map((variant, variantIndex) => (
                      <div key={variantIndex} className="bg-white rounded-md border border-gray-300 p-2 flex items-center space-x-2">
                        {variant?.main_product_image_locator?.[0]?.media_location && (
                          <img
                            src={variant.main_product_image_locator[0].media_location}
                            alt="Variant"
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          {variant?.sku && <p className="text-sm text-gray-600">SKU: {variant.sku}</p>}
                          {variant?.color?.[0]?.value && <p className="text-sm text-gray-600">Color: {variant.color[0].value}</p>}
                          {variant?.size?.[0]?.value && <p className="text-sm text-gray-600">Size: {variant.size[0].value}</p>}
                          {variant?.price && <p className="text-sm text-gray-600">Price: ₹{variant.price}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="mt-6 border-t pt-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><strong>Shipping Charges:</strong> <p className="text-gray-700">₹{orderDetails?.shippingCharges || 0}</p></div>
              <div><strong>Total Amount:</strong> <p className="text-green-600 font-semibold">₹{orderDetails?.totalAmount || 0}</p></div>
              <div><strong>Advance Deposit:</strong> <p className="text-gray-700">₹{orderDetails?.advanceDiposite || 0}</p></div>
              <div><strong>COD Amount:</strong> <p className="text-gray-700">₹{orderDetails?.codAmount || 0}</p></div>
              <div><strong>Courier Charge:</strong> <p className="text-gray-700">₹{orderDetails?.courierCharge || 0}</p></div>
              <div><strong>Return Courier Charge:</strong> <p className="text-gray-700">₹{orderDetails?.returnCourierCharge || 0}</p></div>
              <div><strong>Shipper:</strong> <p className="text-gray-700">{orderDetails?.shipper || 'N/A'}</p></div>
              <div><strong>Status:</strong> <p className={`text-sm font-semibold ${
                  orderDetails?.status === 'pending' ? 'text-yellow-500' :
                  orderDetails?.status === 'processing' ? 'text-blue-500' :
                  orderDetails?.status === 'shipped' ? 'text-green-500' :
                  orderDetails?.status === 'delivered' ? 'text-green-700' :
                  orderDetails?.status === 'cancelled' ? 'text-red-500' :
                  'text-gray-700'
                }`}>{orderDetails?.status || 'N/A'}</p></div>
              <div><strong>Delivery Date:</strong> <p className="text-gray-700">{orderDetails?.deliveryDate || 'N/A'}</p></div>
              <div><strong>Dispatched Date:</strong> <p className="text-gray-700">{orderDetails?.dispatchedDate || 'N/A'}</p></div>
              <div><strong>Tracking ID:</strong> <p className="text-gray-700">{orderDetails?.trackingId || 'N/A'}</p></div>
              <div><strong>Note:</strong> <p className="text-gray-700">{orderDetails?.note || 'N/A'}</p></div>
              <div><strong>Return:</strong> <p className="text-gray-700">{orderDetails?.return || 'N/A'}</p></div>
              <div><strong>Details Sent:</strong> <p className="text-gray-700">{orderDetails?.detailsSendToCustomer === 'yes' ? 'Yes' : orderDetails?.detailsSendToCustomer === 'no' ? 'No' : 'N/A'}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;