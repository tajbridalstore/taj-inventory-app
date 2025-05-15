import useGetOrders from "@/hooks/useGetOrders";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  fetchCancelItems,
  fetchMenifestItems,
  removePendingOrder, // Import the action
} from "@/store/orderSlice";
import axios from "axios";
import { BASE_URL } from "@/services/api";

const AppPendingOrdres = () => {
  useGetOrders();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pendingOrders = [] } = useSelector((state) => state.order);
  const [menifestItems, setMenifestItems] = useState([]);
  console.log(pendingOrders);
  // Only include orders that have at least one pending item
  const filteredPendingOrders = pendingOrders.filter((order) =>
    order.orderItems?.some((item) => item.status === "pending")
  );

  const handleCheckboxChange = (orderId, variantSku, isChecked) => {
    setMenifestItems((prevItems) => {
      const orderItems = prevItems[orderId] || {};
      const updatedItems = {
        ...prevItems,
        [orderId]: {
          ...orderItems,
          [variantSku]: isChecked ? { quantity: 1 } : undefined,
        },
      };

      if (!updatedItems[orderId][variantSku]) {
        delete updatedItems[orderId][variantSku];
      }

      return updatedItems;
    });
  };

  const handleQuantityChange = (orderId, variantSku, quantity) => {
    setMenifestItems((prevItems) => {
      const orderItems = prevItems[orderId] || {};
      return {
        ...prevItems,
        [orderId]: {
          ...orderItems,
          [variantSku]: { quantity: parseInt(quantity, 10) || 1 },
        },
      };
    });
  };

  const handleAddToManifest = async () => {
    const formattedManifestItems = Object.entries(menifestItems).reduce(
      (acc, [orderId, orderItems]) => {
        const items = Object.entries(orderItems)
          .filter(([_, data]) => data?.quantity > 0)
          .map(([sku, data]) => ({
            sku,
            quantity: data.quantity,
          }));

        if (items.length > 0) {
          acc[orderId] = items;
        }
        return acc;
      },
      {}
    );

    try {
      for (const [orderId, manifestItems] of Object.entries(
        formattedManifestItems
      )) {
        const response = await axios.put(
          `${BASE_URL}/api/v1/order/app-order-update`,
          {
            orderId: orderId,
            manifestItems,
          }
        );
        if (response.data.success) {
          dispatch(fetchMenifestItems(response));
          navigate(`/menifest-orders`);
        } else {
          console.warn(`Failed to update Order ${orderId}`);
        }
      }
    } catch (err) {
      console.error("Error adding to manifest:", err);
      alert("Error adding items to manifest");
    }
  };

  const handleCancelOrder = async (orderId, item) => {
    const cancelOrderItemIds = [item._id];
    try {
      // Dispatch the action to remove the order from pendingOrders immediately
      dispatch(removePendingOrder(orderId));

      const response = await axios.post(
        `${BASE_URL}/api/v1/order/cancel-order-with-status`,
        { orderId, orderItemIds: cancelOrderItemIds }
      );
      alert(response.data.message || "Order item cancelled successfully.");
      dispatch(fetchCancelItems(response));
    } catch (error) {
      console.error("Failed to cancel order item:", error);
      alert(error.response?.data?.message || "Failed to cancel order item.");
      // Optionally, you might want to handle re-adding the order to pendingOrders on failure
    }
  };

  return (
    <div>
      <div className="border-1 border-gray-100 p-4 rounded-xl">
        <h2 className="text-xl font-semibold">App Pending Orders</h2>

        {filteredPendingOrders.length > 0 ? (
          <Table className="w-full mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPendingOrders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.orderType}</TableCell>
                  <TableCell>₹{order.totalAmount}</TableCell>
                  <TableCell>
                    {order.orderItems
                      .filter((item) => item.status === "pending")
                      .reduce((total, item) => total + item.quantity, 0)}
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      onClick={() => navigate(`/order-details/${order._id}`)}
                    >
                      View Item
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">Add To Manifest</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 max-h-96 overflow-auto">
                        <div className="space-y-4">
                          {(() => {
                            const uniqueVariantsMap = new Map();
                            order.orderItems?.forEach((item) => {
                              item.product?.variants?.forEach((variant) => {
                                if (!uniqueVariantsMap.has(variant.sku)) {
                                  uniqueVariantsMap.set(variant.sku, {
                                    variant,
                                    item,
                                  });
                                }
                              });
                            });

                            return Array.from(uniqueVariantsMap.values()).map(
                              ({ variant, item }, index) => {
                                const image =
                                  variant?.main_product_image_locator?.[0]
                                    ?.media_location ||
                                  item.product?.productImage?.[0] ||
                                  "https://via.placeholder.com/40";
                                const title =
                                  item.product?.productTitle ||
                                  "Untitled Product";
                                const size =
                                  variant?.size?.[0]?.value || variant?.sku;
                                const variantSku = variant.sku;

                                return (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 border-b pb-3"
                                  >
                                    <Checkbox
                                      checked={
                                        menifestItems[order.orderId]?.[
                                          variantSku
                                        ] !== undefined
                                      }
                                      onCheckedChange={(isChecked) =>
                                        handleCheckboxChange(
                                          order.orderId,
                                          variantSku,
                                          isChecked
                                        )
                                      }
                                    />
                                    <img
                                      src={image}
                                      alt="variant"
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {title} {size && ` - ${size}`}
                                      </p>
                                      <Input
                                        type="number"
                                        placeholder="Quantity"
                                        className="mt-1 w-24"
                                        defaultValue={1}
                                        disabled={
                                          menifestItems[order.orderId]?.[
                                            variantSku
                                          ] === undefined
                                        }
                                        onChange={(e) =>
                                          handleQuantityChange(
                                            order.orderId,
                                            variantSku,
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                );
                              }
                            );
                          })()}
                          <div className="text-right">
                            <Button onClick={handleAddToManifest}>
                              Add Selected
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <div className="flex flex-col items-end mt-3">
                      {order.orderItems
                        .filter((item) => item.status === "pending")
                        .map((item, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleCancelOrder(order._id, item) // Use order._id here
                            }
                          >
                            Cancel Item
                          </Button>
                        ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 mt-2">No Pending App Orders</p>
        )}
      </div>
    </div>
  );
};

export default AppPendingOrdres;