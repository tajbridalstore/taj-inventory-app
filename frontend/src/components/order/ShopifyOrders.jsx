import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import useGetShopifyOrders from "@/hooks/useGetShopifyOrders";

const ShopifyOrders = () => {
  useGetShopifyOrders();
  const navigate = useNavigate();
  
 const {shopifyLoading,shopifyError, shopifyTotalOrders} = useSelector(state => state.order);
 console.log(shopifyTotalOrders)
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


 
      

     
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedOrders = shopifyTotalOrders?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(shopifyTotalOrders?.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <div className="w-full h-full p-4">
      {shopifyLoading && <p>Loading orders...</p>}
      {shopifyError && <p className="text-red-500">Error: {shopifyError}</p>}

      {!shopifyLoading && !shopifyError && (
        <>
          {shopifyTotalOrders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <>
              <Table className="w-full h-full table-fixed bg-blue-50 rounded-2xl p-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.fulfillment_status || order.financial_status || 'Pending'}</TableCell>
                      <TableCell>{order.payment_gateway_names?.join(', ') || 'N/A'}</TableCell>
                      <TableCell>₹{order.total_price}</TableCell>
                      <TableCell className="text-right">
                        <Button className="cursor-pointer" onClick={() => navigate(`/shopify-order-detail/${order.id}`)}>
                          View Item
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {shopifyTotalOrders.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="mr-2"
                  >
                    Prev
                  </Button>
                  <p>
                    Page {currentPage} of {totalPages}
                  </p>
                  <Button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="ml-2"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ShopifyOrders;
