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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import {
//   fetchCancelShopifyItems,
//   fetchMenifestShopifyItems,
//   removePendingShopifyOrder,
// } from "@/store/orderSlice";
import axios from "axios";
import { BASE_URL } from "@/services/api";
import useGetShopifyOrders from "@/hooks/useGetShopifyOrders";
import { toast } from "sonner";
import { fetchMenifestItems } from "@/store/orderSlice";

const ShopifyPendingOrders = () => {
  useGetShopifyOrders();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { shopifyPendingOrders = [] } = useSelector((state) => state.order);
  const [shopifyMenifestItems, setShopifyMenifestItems] = useState({}); // Changed to object keyed by order ID

  // Only include orders that have at least one pending line item
  const filteredShopifyPendingOrders = shopifyPendingOrders.filter((order) =>
    order.line_items?.some((item) => item.fulfillment_status === null)
  );

  const handleShopifyCheckboxChange = (orderId, lineItemId, isChecked) => {
    setShopifyMenifestItems((prevItems) => ({
      ...prevItems,
      [orderId]: {
        ...prevItems[orderId],
        [lineItemId]: isChecked, // Just store boolean for selection
      },
    }));
  };

  const handleAddToShopifyManifest = async () => {
    const formattedManifestItems = Object.entries(shopifyMenifestItems).reduce(
      (acc, [orderId, selectedItems]) => {
        const items = Object.entries(selectedItems)
          .filter(([, isSelected]) => isSelected)
          .map(([lineItemId]) => ({
            lineItemId: parseInt(lineItemId, 10),
            quantity: 1, // Quantity is always 1 in this version
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
            console.log(response.data)
          dispatch(fetchMenifestItems(response));
        toast.success("Added to manifest")
        } else {
          console.warn(`Failed to update Shopify Order ${orderId}`);
        }
      }
    } catch (err) {
      console.error("Error adding to Shopify manifest:", err);
      alert("Error adding items to Shopify manifest");
    }
  };

  const handleCancelShopifyOrder = async (orderId) => {
    try {
      // Dispatch the action to remove the order from pendingOrders immediately
      dispatch(removePendingShopifyOrder(orderId));

      const response = await axios.post(
        `${BASE_URL}/api/v1/order/cancel-order-with-status`, 
        { orderId } 
      );
      alert(response.data.message || "Shopify order cancelled successfully.");
      // dispatch(fetchCancelShopifyItems(response));
    } catch (error) {
      console.error("Failed to cancel Shopify order:", error);
      alert(
        error.response?.data?.message || "Failed to cancel Shopify order."
      );
    }
  };

  return (
    <div className="border-1 border-gray-100 p-4 rounded-xl">
      <h2 className="text-xl font-semibold">Shopify Pending Orders</h2>

      {filteredShopifyPendingOrders.length > 0 ? (
        <Table className="w-full mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Shopify Order ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShopifyPendingOrders.map((order, index) => (
              <TableRow key={index}>
                <TableCell>{order.name}</TableCell>
                <TableCell>{order.fulfillment_status || "Pending"}</TableCell>
                <TableCell>{order.financial_status}</TableCell>
                <TableCell>₹{order.total_price}</TableCell>
                <TableCell>
                  {order.line_items?.filter(
                    (item) => item.fulfillment_status === null
                  ).length}
                </TableCell>

                <TableCell className="text-right space-x-2">
                  <Button
                    onClick={() => navigate(`/shopify-order-detail/${order.id}`)}
                  >
                    View Item
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Add To Manifest</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 max-h-96 overflow-auto">
                      <div className="space-y-4">
                        {order.line_items?.map((item) => {
                          const imageUrl = item.image?.src || item.properties?.find(
                            (prop) => prop.name === "image_url"
                          )?.value || "https://via.placeholder.com/40";
                          const title = item.name;
                          const variantTitle =
                            item.variant_title !== "Default Title"
                              ? item.variant_title
                              : "";
                          const lineItemId = item.id;

                          return (
                            item.fulfillment_status === null && (
                              <div
                                key={lineItemId}
                                className="flex items-center gap-3 border-b pb-3"
                              >
                                <Checkbox
                                  checked={
                                    shopifyMenifestItems[order.id]?.[
                                      lineItemId
                                    ] || false
                                  }
                                  onCheckedChange={(isChecked) =>
                                    handleShopifyCheckboxChange(
                                      order.id,
                                      lineItemId,
                                      isChecked
                                    )
                                  }
                                />
                                <img
                                  src={imageUrl}
                                  alt="variant"
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {title} {variantTitle && `- ${variantTitle}`}
                                  </p>
                                </div>
                              </div>
                            )
                          );
                        })}
                        <div className="text-right">
                          <Button onClick={handleAddToShopifyManifest}>
                            Add Selected to Manifest
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Single Cancel Button per Order */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCancelShopifyOrder(order.id)} // Use order.id
                    className="mt-2" 
                  >
                    Cancel Order
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-gray-500 mt-2">No Pending Shopify Orders</p>
      )}
    </div>
  );
};

export default ShopifyPendingOrders;