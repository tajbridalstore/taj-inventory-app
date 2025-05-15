import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useGetOrders from "@/hooks/useGetOrders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { BASE_URL } from "@/services/api";
import {
  fetchCancelItems,
  fetchDeliveredItems,
  fetchIntransitItems,
  removeIntransitItem,
} from "@/store/orderSlice";
import { useNavigate } from "react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const DispatchOrder = () => {
  useGetOrders();
  const { intransitItems } = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [newCourierCharges, setNewCourierCharges] = useState({});
  const [loadingDelivery, setLoadingDelivery] = useState({});

  const groupedOrders = {};

  intransitItems.forEach((order) => {
    const orderId = order.orderId;
    const orderItems = order.orderItems.filter(
      (item) => item.status === "intransit"
    );

    if (orderItems.length > 0) {
      groupedOrders[orderId] = {
        _id: order._id,
        orderId,
        dispatchImages: order.dispatchImages || [],
        items: orderItems.map((item) => ({
          orderItemId: item._id,
          parentTitle: item.product?.productTitle || "N/A",
          variantSKU: item.product?.variants?.[0]?.sku || "N/A",
          quantity: item.quantity || 0,
          status: item.status,
          variantImage: order.dispatchImages[0] || "",
        })),
      };
    }
  });

  const handleCourierChargeChange = (orderId, value) => {
    setNewCourierCharges((prevCharges) => ({
      ...prevCharges,
      [orderId]: value,
    }));
  };

  const markAsDeliveredWithCharge = async (orderId, orderItemId) => {
    const courierCharge = newCourierCharges[orderId] || 0;
    setLoadingDelivery((prev) => ({ ...prev, [orderItemId]: true }));
    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/order/app-order-update-delivered`,
        {
          orderId: orderId,
          orderItemIds: [orderItemId],
          status: "delivered",
          courierCharges: parseFloat(courierCharge),
        }
      );
      dispatch(fetchDeliveredItems(response.data));
      navigate(`/delivered-orders`);
    } catch (error) {
      console.error("Failed to mark as delivered with charge:", error);
    } finally {
      setLoadingDelivery((prev) => ({ ...prev, [orderItemId]: false }));
    }
  };

  const handleCancelOrder = async (orderId, item) => {
    const cancelOrderItemIds = [item.orderItemId];
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/order/cancel-order-with-status`,
        { orderId, orderItemIds: cancelOrderItemIds }
      );
      alert(response.data.message || "Order item cancelled successfully.");
      dispatch(fetchCancelItems(response));
      dispatch(removeIntransitItem(item._id));
    } catch (error) {
      console.error("Failed to cancel order item:", error);
      alert(error.response?.data?.message || "Failed to cancel order item.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">
        Dispatch Orders - In Transit
      </h1>

      {Object.values(groupedOrders).map((order) => (
        <div key={order.orderId} className="mb-6 border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">
            Order ID: {order.orderId}
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispatch Image</TableHead>
                <TableHead>Product Title</TableHead>
                <TableHead>Variant SKU</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {order.dispatchImages[0] ? (
                      <img
                        src={order.dispatchImages[0]}
                        alt="Dispatch"
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </TableCell>
                  <TableCell>{item.parentTitle}</TableCell>
                  <TableCell>{item.variantSKU}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm">Mark Delivered</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Enter Courier Charge
                          </p>
                          <Input
                            type="number"
                            placeholder="0"
                            className="w-full"
                            value={newCourierCharges[order.orderId] || ""}
                            onChange={(e) =>
                              handleCourierChargeChange(
                                order.orderId,
                                e.target.value
                              )
                            }
                          />
                          <Button
                            size="sm"
                            className="w-full flex items-center justify-center gap-2"
                            disabled={loadingDelivery[item.orderItemId]}
                            onClick={() =>
                              markAsDeliveredWithCharge(
                                order.orderId,
                                item.orderItemId
                              )
                            }
                          >
                            {loadingDelivery[item.orderItemId] ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Mark as Delivered"
                            )}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancelOrder(order.orderId, item)}
                    >
                      Cancel Order
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}

      {Object.keys(groupedOrders).length === 0 && (
        <p>No variant items are currently in transit.</p>
      )}
    </div>
  );
};

export default DispatchOrder;
