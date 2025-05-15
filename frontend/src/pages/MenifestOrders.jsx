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
import { useNavigate } from "react-router";
import { fetchCancelItems, fetchIntransitItems, removeManifestItem } from "@/store/orderSlice";
import useGetOrders from "@/hooks/useGetOrders";

const MenifestOrders = () => {
  useGetOrders();
  const { menifestItems } = useSelector((state) => state.order);
  const [localManifestItems, setLocalManifestItems] = useState(menifestItems); // New local state
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  console.log("menifestItems111111", menifestItems);

  useEffect(() => {
    setLocalManifestItems(menifestItems); // Keep local state in sync with Redux state
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
  };

  const dispatchImages = watch("dispatchImages");

  const onSubmit = async (data) => {
    if (!selectedItem) {
      console.warn("No selected item to dispatch");
      return;
    }
    const orderId = selectedOrder.orderId;

    try {
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
        handleCloseDispatchDialog();
        navigate(`/dispatch-orders`);
      } else {
        console.error("Dispatch failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error dispatching order:", error);
    }
  };

  const handleCancelOrder = async (orderId, item) => {
    console.log("handleCancelOrder", item);
    const cancelOrderItemIds = [item._id]; // Send an array with the specific item's _id
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/order/cancel-order-with-status`,
        { orderId, orderItemIds: cancelOrderItemIds }
      );
      console.log("Order item cancelled:", response.data);
      alert(response.data.message || "Order item cancelled successfully.");
dispatch(fetchCancelItems(response))
      // Optimistically update local state
      // setLocalManifestItems((prevItems) =>
      //   prevItems.filter(
      //     (itemWrapper) =>
      //       itemWrapper?.data?.order?.orderItems?.findIndex(
      //         (orderItem) => orderItem._id === item._id
      //       ) === -1
      //   )
      // );

      // Dispatch action to update Redux store
      dispatch(removeManifestItem(item._id));

    } catch (error) {
      console.error("Failed to cancel order item:", error);
      alert(error.response?.data?.message || "Failed to cancel order item.");
      // Optionally, revert local state update on error
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
                  <strong>Order ID:</strong>
                  {order.orderId}
                </h2>
                <p>
                  <strong> Order Date:</strong>{" "}
                  {new Date(order.orderDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Customer Name:</strong> {order.name}
                </p>
                <p>
                  <strong> Shipping Address: </strong>
                  {order.address}, {order.city},{order.pinCode}, {order.country}
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

                        {item.product?.variants?.length > 0 ? (
                          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                            {item.product.variants.map((variant, i) => (
                              <li
                                key={i}
                                className="border p-1 rounded text-xl space-y-3 mt-2"
                              >
                                {variant?.main_product_image_locator?.[0]
                                  ?.media_location && (
                                    <img
                                      src={
                                        variant.main_product_image_locator[0]
                                          .media_location
                                      }
                                      alt={`Variant ${i}`}
                                      className="w-full h-80 object-cover rounded-md mb-1"
                                    />
                                  )}
                                <p>
                                  <strong>SKU:</strong> {variant.sku}
                                </p>
                                {variant.size?.[0]?.value && (
                                  <p>
                                    <strong>Size:</strong>{" "}
                                    {variant.size[0].value}
                                  </p>
                                )}
                                {variant.price && (
                                  <p>
                                    <strong>Price:</strong> ₹{variant.price}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No variants for this product.</p>
                        )}

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
                            } // Passing individual item
                          >
                            Cancel Order
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    No items have been added to the manifest for this order yet.
                  </p>
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
            <div className="space-y-2">
              <Label className="text-gray-700">Tracking Number</Label>
              <Input
                {...register("trackingNumber")}
                placeholder="Enter tracking number"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Courier Charges</Label>
              <Input
                {...register("courierCharges")}
                type="number"
                placeholder="e.g. 100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Send details to customer</Label>
              <select
                {...register("detailsSendToCustomer")}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Shipper</Label>
              <select
                {...register("shipper")}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="delhivery">Delhivery</option>
                <option value="ekart">Ekart</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Dispatch Images</Label>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {imagePreviews.map((src, i) => (
                  <div
                    key={i}
                    className="relative border rounded overflow-hidden"
                  >
                    <img
                      src={src}
                      alt={`Preview ${i}`}
                      className="object-cover w-full h-32"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="text-right pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Submit Dispatch
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenifestOrders;