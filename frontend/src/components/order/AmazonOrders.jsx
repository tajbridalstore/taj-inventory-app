import React, { useState, useEffect } from "react";
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
import useGetAmazonOrders from "@/hooks/useGetAmazonOrders";



const AmazonOrders = () => {
  useGetAmazonOrders();
  const {amazonOrders,loading,error} = useSelector(state => state.order)
  console.log(amazonOrders)
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10;
  


  // Pagination Logic
  const totalPages = Math.ceil(amazonOrders?.length / itemsPerPage);
  const paginatedOrders = amazonOrders?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="w-full h-full p-4">
      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          <Table className="w-full h-full table-fixed bg-blue-50 rounded-2xl p-4">
            <TableHeader>
              <TableRow>
                <TableHead>AmazonOrderId</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>PaymentMethod</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.AmazonOrderId}>
                  <TableCell className="font-medium">{order.AmazonOrderId}</TableCell>
                  <TableCell>{order.OrderStatus}</TableCell>
                  <TableCell>{order.PaymentMethod}</TableCell>
                  <TableCell>₹{order.OrderTotal?.Amount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      className="cursor-pointer"
                      onClick={() => navigate(`/amazon-order-detail/${order.AmazonOrderId}`)}
                    >
                      View Item
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {amazonOrders?.length > itemsPerPage && (
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
    </div>
  );
};

export default AmazonOrders;
