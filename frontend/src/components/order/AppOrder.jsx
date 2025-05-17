import useGetOrders from "@/hooks/useGetOrders";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "../ui/button";

const AppOrder = () => {
  const navigate = useNavigate();
  useGetOrders();
  const { totalOrders, loading, error } = useSelector((state) => state.order);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <div>
      <h1>Orders</h1>
      {totalOrders && totalOrders.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow className="text-xl">
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Total Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xl">
            {totalOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order?.orderId}</TableCell>
                <TableCell>
                  {new Date(order?.orderDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {order.orderItems.reduce(
                    (acc, item) => acc + item.quantity,
                    0
                  )}
                </TableCell>

                <TableCell>{order?.status}</TableCell>
                <TableCell>₹{order?.totalAmount}</TableCell>
                <TableCell
                  onClick={() => navigate(`/order-details/${order._id}`)}
                  className="space-x-2 text-right"
                >
                  <Button>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No orders available.</p>
      )}
    </div>
  );
};

export default AppOrder;
