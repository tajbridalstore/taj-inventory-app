import useGetOrders from '@/hooks/useGetOrders';
import React from 'react';
import { useSelector } from 'react-redux';

const CancelOrders = () => {
  useGetOrders();
  const { cancelOrders } = useSelector((state) => state.order);
  console.log("cancelOrders data in component:", cancelOrders);

  // Process the API response to extract the order objects
  const cancelledOrderList = cancelOrders
    .filter(response => response?.data?.order) // Ensure we have an order in the response
    .map(response => response.data.order)
    .filter((order, index, self) =>
      // Ensure uniqueness based on order ID
      index === self.findIndex((o) => o.orderId === order.orderId)
    );

  console.log("Processed cancelledOrderList:", cancelledOrderList);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Cancelled Orders</h1>
      {cancelledOrderList.length > 0 ? (
        <ul className="space-y-6">
          {cancelledOrderList.map((order) => (
            <li key={order._id} className="bg-white rounded-md shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Order ID: <span className="text-blue-600">{order.orderId}</span>
              </h2>
              <p className="text-gray-600 mb-1">
                Order Date: {new Date(order.orderDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600 mb-3">
                Customer Name: <span className="font-semibold">{order.name}</span>
              </p>

              <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Cancelled Items:</h3>
              <ul className="space-y-2">
                {order.orderItems
                  .filter((item) => item.status === 'cancelled')
                  .map((item) => (
                    <li key={item._id} className="bg-gray-100 rounded-md p-3 border border-gray-300">
                      <div className="flex items-center space-x-4">
                        {item.product?.main_product_image_locator?.[0]?.media_location ? (
                          <img
                            src={item.product.main_product_image_locator[0].media_location}
                            alt={item.product.productTitle}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : item.product?.productImage?.[0] ? (
                          <img
                            src={item.product.productImage[0]}
                            alt={item.product.productTitle}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-700">
                            {item.product?.productTitle}
                          </p>
                          <p className="text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          {item.product?.variants?.[0]?.size?.[0]?.value && (
                            <p className="text-gray-600">
                              Size: {item.product.variants[0].size[0].value}
                            </p>
                          )}
                          {item.product?.variants?.[0]?.price && (
                            <p className="text-gray-600">
                              Price: ₹{item.product.variants[0].price}
                            </p>
                          )}
                          {/* You can display other relevant product details here */}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No cancelled orders found.</p>
      )}
    </div>
  );
};

export default CancelOrders;