import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { useSelector } from 'react-redux';
  
const AmazonPendingOrders = () => {
    const {loading,error,amazonPendingOrders} = useSelector(state => state.order);
    console.log(amazonPendingOrders)
  return (
    <div className="p-6">
    <h2 className="text-2xl font-semibold mb-4">Pending Orders</h2>

    {loading && <p>Loading...</p>}
    {error && <p className="text-red-500">{error}</p>}

    {!loading && amazonPendingOrders?.length > 0 && (
      <Table className="w-full h-full table-fixed bg-blue-50 rounded-2xl p-4">
        <TableHeader>
          <TableRow>
       
            <TableHead>Amazon Order Id</TableHead>
            <TableHead>EasyShipShipmentStatus</TableHead>
            <TableHead>Order Status</TableHead>
            <TableHead>Postal Code</TableHead>
            <TableHead  className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {amazonPendingOrders.map((pendingOrder, index) => (
            <TableRow key={index}>
        
              <TableCell>{pendingOrder.AmazonOrderId}</TableCell>
              <TableCell>{pendingOrder.EasyShipShipmentStatus}</TableCell>
              <TableCell>{pendingOrder.OrderStatus}</TableCell>
              <TableCell>{pendingOrder.ShippingAddress.PostalCode}</TableCell>
              <TableCell  className="text-right">
                ₹{pendingOrder.OrderTotal?.Amount ?? "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}

    {!loading && amazonPendingOrders?.length === 0 && (
      <p>No order items found for this order.</p>
    )}
  </div>
  )
}

export default AmazonPendingOrders