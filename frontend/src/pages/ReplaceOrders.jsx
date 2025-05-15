import useGetOrders from '@/hooks/useGetOrders';
import React from 'react';
import { useSelector } from 'react-redux';

const ReplaceOrders = () => {
  useGetOrders();
  const { replacedOrders } = useSelector((state) => state.order);
  console.log('Replaced Orders Data:', replacedOrders);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">Replaced Orders</h1>
      {replacedOrders && replacedOrders.length > 0 ? (
        replacedOrders.map((response, index) => {
          const order = response?.data?.order;
          return order ? (
            <div key={index} className="bg-white rounded-md shadow-md p-6 mb-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Order ID: {order?.orderId || 'N/A'}</h2>
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Order Date:</span>{' '}
                  {order?.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Order Type:</span> {order?.orderType || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Name:</span> {order?.name || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Mobile:</span>{' '}
                  {Array.isArray(order?.mobile) ? order.mobile.map(m => m?.number).join(', ') : 'N/A'}
                </p>
                <p className="col-span-2">
                  <span className="font-semibold">Address:</span>{' '}
                  {order?.address || 'N/A'}, {order?.city || 'N/A'}, {order?.pinCode || 'N/A'}, {order?.country || 'N/A'}
                </p>
                <p className="col-span-2">
                  <span className="font-semibold">Note:</span> {order?.note || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Advance Deposit:</span> ₹{order?.advanceDiposite !== undefined ? order.advanceDiposite : 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Amount:</span> ₹{order?.amount !== undefined ? order.amount : 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Shipping Charges:</span> ₹{order?.shippingCharges !== undefined ? order.shippingCharges : 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">COD Amount:</span> ₹{order?.codAmount !== undefined ? order.codAmount : 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Total Amount:</span> ₹{order?.totalAmount !== undefined ? order.totalAmount : 'N/A'}
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Order Items:</h3>
              {Array.isArray(order?.orderItems) && order.orderItems.length > 0 ? (
                <div className="space-y-4">
                  {order.orderItems.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-gray-50 rounded-md p-4 flex items-start space-x-4">
                      {item?.product?.variants && item.product.variants.length > 0 && item.product.variants[0]?.main_product_image_locator && item.product.variants[0].main_product_image_locator.length > 0 ? (
                        <div className="w-24 h-24 rounded-md overflow-hidden shadow-sm">
                          <img
                            src={item.product.variants[0].main_product_image_locator[0]?.media_location}
                            alt={item?.product?.productTitle || 'Product Image'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                      <div>
                        <h4 className="text-md font-semibold text-gray-700">{item?.product?.productTitle || 'N/A'}</h4>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">SKU:</span> {item?.variantDetails?.sku || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Quantity:</span> {item?.quantity !== undefined ? item.quantity : 'N/A'}
                        </p>
                        {item?.product?.variants && item.product.variants.length > 0 && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>
                              <span className="font-semibold">Price:</span> ₹{item.product.variants[0]?.price !== undefined ? item.product.variants[0].price : 'N/A'}
                            </p>
                            {item.product.variants[0]?.color && Array.isArray(item.product.variants[0]?.color) && item.product.variants[0]?.color.length > 0 && (
                              <p>
                                <span className="font-semibold">Color:</span>{' '}
                                {item.product.variants[0].color.map(c => c?.value).join(', ')}
                              </p>
                            )}
                            {item.product.variants[0]?.size && Array.isArray(item.product.variants[0]?.size) && item.product.variants[0]?.size.length > 0 && (
                              <p>
                                <span className="font-semibold">Size:</span>{' '}
                                {item.product.variants[0].size.map(s => s?.value).join(', ')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No items in this order.</p>
              )}
            </div>
          ) : null;
        })
      ) : (
        <p className="text-gray-600">No replaced orders found.</p>
      )}
    </div>
  );
};

export default ReplaceOrders;