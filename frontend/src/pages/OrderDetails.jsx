// Frontend (OrderDetails component)

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { BASE_URL } from '@/services/api'; // Adjust your API import

const OrderDetails = () => {
    const { orderId } = useParams(); // Rename 'id' to 'orderId' for clarity
    const [orderDetails, setOrderDetails] = useState([]);
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
        return <div>Loading order details...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!orderDetails) {
        return <div>Order not found.</div>;
    }
    console.log(orderDetails)
    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            {/* ... other order details ... */}

            <h3 className="text-lg font-semibold mb-2">Order Items:</h3>
            {orderDetails?.orderItems?.map((item, index) => (
                <div key={index} className="mb-4 border rounded-md p-4 text-xl">
                    <div className="flex items-start">
                        <div className='space-y-3 '>
                            <p className="font-semibold">{item.product?.productTitle || 'Product Title Not Available'}</p>

                            <p><strong>Product SKU:</strong> {item.product?.sku || 'N/A'}</p>
                            <p><strong>Quantity:</strong> {item.quantity}</p>
                            <p><strong>Status:</strong> {item.status}</p>

                            <h4 className="font-semibold mt-2">All Variants for this Product:</h4>
                            {item.product?.variants?.map((variant, variantIndex) => (
                                <div key={variantIndex} className="ml-4 mb-2 p-2 border rounded space-y-3 text-xl">
                                    {variant?.main_product_image_locator?.[0]?.media_location ? (
                                        <img
                                            src={variant.main_product_image_locator[0].media_location}
                                            alt="Variant Image"
                                            className="w-20 h-20 object-cover rounded mb-2"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-gray-200 rounded mb-2 flex items-center justify-center">
                                            No Variant Image
                                        </div>
                                    )}
                                    <p><strong>Variant SKU:</strong> {variant.sku || 'N/A'}</p>
                                    {variant?.color?.[0]?.value && (
                                        <p><strong>Color:</strong> {variant.color[0].value}</p>
                                    )}
                                    {variant?.size?.[0]?.value && (
                                        <p><strong>Size:</strong> {variant.size[0].value}</p>
                                    )}
                                 
                                    {variant?.price && (
                                        <p><strong>Price:</strong> ₹{variant.price}</p>
                                    )}
                                    {
                                        <p><strong>ShippingCharges:</strong> ₹{orderDetails?.shippingCharges}</p>
                                    }
                                     {orderDetails?.totalAmount && (
                                        <p><strong>Total Amount:</strong> ₹{orderDetails?.totalAmount}</p>
                                    )}
                                </div>
                            ))}

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

};

export default OrderDetails;