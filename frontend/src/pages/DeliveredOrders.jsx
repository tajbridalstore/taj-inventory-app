import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner'; // For notifications
import axios from 'axios'; // For making the API call
import { BASE_URL } from '@/services/api';
import {  fetchReplacedItems, removeDeliveredItem } from '@/store/orderSlice';
import { useNavigate } from 'react-router';

const DeliveredOrders = () => {
  const dispatch = useDispatch();
  const { deliveredItems } = useSelector((state) => state.order);
  const [showPopover, setShowPopover] = useState(false);
  const [replacementItems, setReplacementItems] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const deliveredProducts =
    deliveredItems?.flatMap((item) =>
      item.updatedOrder?.orderItems
        ?.filter((orderItem) => orderItem.status === 'delivered')
        ?.map((orderItem) => ({
          ...orderItem,
          orderId: item.updatedOrder?.orderId,
        }))
    ) || [];

  const toggleItemSelection = (id) => {
    setReplacementItems((prev) => ({
      ...prev,
      [id]: prev[id]
        ? { ...prev[id], isSelected: !prev[id].isSelected }
        : { isSelected: true, newSku: '' },
    }));
  };

  const handleNewSkuChange = (id, newSku) => {
    setReplacementItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], newSku },
    }));
  };

  const getSelectedReplacementItems = () => {
    return Object.entries(replacementItems)
      .filter(([, data]) => data?.isSelected)
      .map(([itemId, data]) => {
        const deliveredItem = deliveredProducts.find((dp) => dp._id === itemId);
        return {
          originalOrderItemId: itemId, 
          newSku: data?.newSku,
          originalSku: deliveredItem?.variantDetails?.sku, 
        };
      });
  };

  const handleConfirmReplacement = async () => {
    setIsSubmitting(true); 
    const itemsToReplace = getSelectedReplacementItems();

    if (itemsToReplace.length === 0) {
      toast.error('Please select items for replacement.');
      setIsSubmitting(false);
      return;
    }

   
    const originalOrderId = deliveredProducts[0].orderId;

    const replacementData = {
      originalOrderId,
      replacedItems: itemsToReplace,
      orderFrom: deliveredItems[0]?.orderFrom, 
      orderType: deliveredItems[0]?.orderType,
      orderDate: deliveredItems[0]?.orderDate,
      advanceDiposite: deliveredItems[0]?.advanceDiposite,
      name: deliveredItems[0]?.name,
      mobile: deliveredItems[0]?.mobile,
      city: deliveredItems[0]?.city,
      pinCode: deliveredItems[0]?.pinCode,
      country: deliveredItems[0]?.country,
      address: deliveredItems[0]?.address,
      note: deliveredItems[0]?.note,
    };

    try {
      
      const response = await axios.post(`${BASE_URL}/api/v1/order/re-create-order`, replacementData); 
      toast.success(response.data.message); 
      dispatch(fetchReplacedItems(response))
     dispatch(removeDeliveredItem(originalOrderId)); 
      setShowPopover(false); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create replacement order'); 
      console.error('Error replacing order:', error);
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Delivered Products</h2>

      {deliveredProducts.length === 0 ? (
        <p>No delivered items found.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">Order ID</th>
              <th className="border px-4 py-2">Image</th>
              <th className="border px-4 py-2">SKU</th>
              <th className="border px-4 py-2">Quantity</th>
              <th className="border px-4 py-2">Variant SKU</th>
            </tr>
          </thead>
          <tbody>
            {deliveredProducts.map((item, index) => {
              const product = item.product;
              const variant = product?.variants?.[0];

              return (
                <tr key={item._id}>
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{item.orderId}</td>
                  <td className="border px-4 py-2">
                    <img
                      src={variant?.main_product_image_locator?.[0]?.media_location}
                      alt={product?.productTitle || 'Product Image'}
                      className="h-12 w-12 object-cover rounded"
                    />
                  </td>
                  <td className="border px-4 py-2">{product?.sku || 'N/A'}</td>
                  <td className="border px-4 py-2">{item.quantity}</td>
                  <td className="border px-4 py-2">{variant?.sku || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Replacement Button */}
      <Button className="mt-4" onClick={() => setShowPopover(!showPopover)}>
        Replacement
      </Button>

      {/* Popover */}
      {showPopover && (
        <div className="absolute mt-2 p-4 bg-white border shadow-lg rounded-lg z-50 w-[400px] max-h-[400px] overflow-y-auto">
          <h3 className="font-semibold mb-2">Select Products for Replacement</h3>
          {deliveredProducts.map((item) => {
            const product = item.product;
            const variant = product?.variants?.[0];
            const itemId = item._id;
            return (
              <div key={itemId} className="flex flex-col gap-2 border-b py-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={replacementItems[itemId]?.isSelected || false}
                    onChange={() => toggleItemSelection(itemId)}
                  />
                  <img
                    src={variant?.main_product_image_locator?.[0]?.media_location}
                    alt="Product"
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="text-sm">
                    <p>
                      <strong>SKU:</strong> {variant?.sku}
                    </p>
                    <p>
                      <strong>OrderId:</strong> {item.orderId}
                    </p>
                  </div>
                </div>
                {replacementItems[itemId]?.isSelected && (
                  <Input
                    type="text"
                    placeholder="New SKU"
                    value={replacementItems[itemId]?.newSku || ''}
                    onChange={(e) => handleNewSkuChange(itemId, e.target.value)}
                    className="w-full mt-1"
                  />
                )}
              </div>
            );
          })}
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setShowPopover(false)}>Cancel</Button>
            <Button
              variant="outline"
              onClick={handleConfirmReplacement}
              disabled={isSubmitting} // Disable during API call
            >
              {isSubmitting ? 'Replacing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveredOrders;

