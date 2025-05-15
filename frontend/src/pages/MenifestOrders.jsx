import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { BASE_URL } from "@/services/api";
import {
  fetchCancelItems,
  fetchIntransitItems,
  removeManifestItem,
} from "@/store/orderSlice";
import useGetOrders from "@/hooks/useGetOrders";

const MenifestOrders = () => {
  useGetOrders();
  const { menifestItems } = useSelector((state) => state.order);
  const [localManifestItems, setLocalManifestItems] = useState(menifestItems);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDispatching, setIsDispatching] = useState(false); // Spinner state

  const dispatch = useDispatch();
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      trackingNumber: "",
      courierCharges: "",
      dispatchImages: [],
      detailsSendToCustomer: "no",
      shipper: "delhivery",
    },
  });

  useEffect(() => {
    setLocalManifestItems(menifestItems);
  }, [menifestItems]);

  useEffect(() => {
    if (!isDispatchDialogOpen) {
      setImagePreviews([]);
    }
  }, [isDispatchDialogOpen]);

  const handleOpenDispatchDialog = (item, order) => {
    setSelectedItem(item);
    setSelectedOrder(order);
    setIsDispatchDialogOpen(true);
    reset();
  };

  const handleCloseDispatchDialog = () => {
    setIsDispatchDialogOpen(false);
    reset();
    setImagePreviews([]);
    setIsDispatching(false);
  };

  const onSubmit = async (data) => {
    if (!selectedItem) {
      console.warn("No selected item to dispatch");
      return;
    }

    const orderId = selectedOrder.orderId;

    try {
      setIsDispatching(true);
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("trackingNumber", data.trackingNumber);
      formData.append("courierCharges", data.courierCharges);
      formData.append("detailsSendToCustomer", data.detailsSendToCustomer);
      formData.append("status", "pending");
      formData.append("shipper", data.shipper);
      formData.append("items", JSON.stringify([selectedItem]));

      if (data.dispatchImages?.length > 0) {
        Array.from(data.dispatchImages).forEach((file) => {
          formData.append("dispatchImages", file);
        });
      }

      const response = await axios.put(
        `${BASE_URL}/api/v1/order/app-order-update-intransit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        dispatch(fetchIntransitItems(response?.data?.data?.order));
        dispatch(removeManifestItem(selectedItem._id));
        handleCloseDispatchDialog();
      } else {
        console.error("Dispatch failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error dispatching order:", error);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCancelOrder = async (orderId, item) => {
    const cancelOrderItemIds = [item._id];
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/order/cancel-order-with-status`,
        { orderId, orderItemIds: cancelOrderItemIds }
      );
      alert(response.data.message || "Order item cancelled successfully.");
      dispatch(fetchCancelItems(response));
      dispatch(removeManifestItem(item._id));
    } catch (error) {
      console.error("Failed to cancel order item:", error);
      alert(error.response?.data?.message || "Failed to cancel order item.");
    }
  };

  return (
    <div>
      <h1 className="text-xl py-4">Manifested Orders</h1>
      {Array.isArray(localManifestItems) && localManifestItems.length > 0 ? (
        localManifestItems.map((itemWrapper, idx) => {
          const order = itemWrapper?.data?.order;
          if (!order) return null;

          const manifestedItems = order.orderItems?.filter(
            (item) => item.status === "manifest"
          );

          return (
            <ul key={idx}>
              <li className="border p-4 mb-4 rounded space-y-3 text-xl">
                <h2>
                  <strong>Order ID:</strong> {order.orderId}
                </h2>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(order.orderDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Customer Name:</strong> {order.name}
                </p>
                <p>
                  <strong>Shipping Address:</strong> {order.address},{" "}
                  {order.city}, {order.pinCode}, {order.country}
                </p>
                <p>
                  <strong>Mobile:</strong> {order?.mobile?.[0]?.number}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹{order.amount}
                </p>
                <p>
                  <strong>COD Amount:</strong> ₹{order.codAmount}
                </p>

                <h3>Manifested Items:</h3>
                {manifestedItems?.length > 0 ? (
                  <ul>
                    {manifestedItems.map((item, index) => (
                      <li key={index} className="border p-2 mb-2 rounded">
                        <h4>Product: {item.product?.productTitle}</h4>
                        <p>Quantity: {item.quantity}</p>

                        <div className="text-right mt-2 space-x-2">
                          <Button
                            onClick={() =>
                              handleOpenDispatchDialog(item, order)
                            }
                          >
                            Add to Dispatch
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleCancelOrder(order.orderId, item)
                            }
                          >
                            Cancel Order
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No items added to manifest for this order.</p>
                )}
              </li>
            </ul>
          );
        })
      ) : (
        <p>No order details found in the manifest.</p>
      )}

      {/* Dispatch Dialog */}
      <Dialog
        open={isDispatchDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDispatchDialog();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-800">
              Dispatch Details
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label>Tracking Number</Label>
              <Input {...register("trackingNumber")} placeholder="Enter tracking number" />
            </div>

            <div>
              <Label>Courier Charges</Label>
              <Input
                {...register("courierCharges")}
                type="number"
                placeholder="e.g. 100"
              />
            </div>

            <div>
              <Label>Send details to customer</Label>
              <select
                {...register("detailsSendToCustomer")}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <Label>Shipper</Label>
              <select
                {...register("shipper")}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="delhivery">Delhivery</option>
                <option value="ekart">Ekart</option>
              </select>
            </div>

            <div>
              <Label>Dispatch Images</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                {...register("dispatchImages")}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const previews = files.map((file) =>
                    URL.createObjectURL(file)
                  );
                  setImagePreviews(previews);
                }}
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {imagePreviews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="w-full h-48 object-cover rounded"
                    alt={`Preview ${i}`}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isDispatching}>
                {isDispatching ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Dispatching...
                  </div>
                ) : (
                  "Dispatch Now"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenifestOrders;
