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

  const { shopifyLoading, shopifyError, shopifyTotalOrders } = useSelector(
    (state) => state.order
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedOrders = shopifyTotalOrders?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(shopifyTotalOrders?.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
  };

  console.log(shopifyTotalOrders)
  return (
    <div className="w-full min-h-[300px] p-4 bg-white rounded-xl shadow-md max-w-7xl mx-auto">
      {shopifyLoading && (
        <p className="text-center text-gray-600 text-lg py-20">Loading orders...</p>
      )}
      {shopifyError && (
        <p className="text-center text-red-500 font-semibold py-20">
          Error: {shopifyError}
        </p>
      )}

      {!shopifyLoading && !shopifyError && (
        <>
          {shopifyTotalOrders.length === 0 ? (
            <p className="text-center text-gray-500 text-lg py-20">No orders found.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl shadow-inner border border-blue-100">
                <Table className="min-w-[600px] w-full table-fixed bg-blue-50 rounded-xl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left text-xl px-4 py-3 text-blue-900 font-semibold sm:text-base">
                        Order ID
                      </TableHead>
                      <TableHead className="text-left text-xl px-4 py-3 text-blue-900 font-semibold sm:text-base">
                        Status
                      </TableHead>
                      <TableHead className="text-left px-4 py-3 text-blue-900 font-semibold text-xl sm:text-base">
                        Payment Method
                      </TableHead>
                      <TableHead className="text-left px-4 py-3 text-blue-900 font-semibold text-xl sm:text-base">
                        Total Amount
                      </TableHead>
                      <TableHead className="text-right px-4 py-3 text-blue-900 font-semibold text-xl sm:text-base">
                        View
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="text-xl">
                    {paginatedOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="hover:bg-blue-100 transition-colors duration-150"
                      >
                        <TableCell className="font-medium px-4 py-3 max-w-xs truncate">
                          {order.id}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {order.fulfillment_status ||
                            order.financial_status ||
                            "Pending"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {order.payment_gateway_names?.join(", ") || "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-semibold">
                          ₹{order.total_price}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            onClick={() =>
                              navigate(`/shopify-order-detail/${order.id}`)
                            }
                            className="text-blue-700 hover:text-blue-900 border-blue-700 hover:border-blue-900"
                          >
                            View Item
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {shopifyTotalOrders.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 mt-6 px-1">
                  <Button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </Button>

                  <p className="text-gray-700 font-medium">
                    Page{" "}
                    <span className="font-semibold">{currentPage}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </p>

                  <Button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
