import useGetAmazonOrders from "@/hooks/useGetAmazonOrders";
import { useState } from "react";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";

const AmazonOrders = () => {
  useGetAmazonOrders();
  const { amazonOrders, loading, error } = useSelector(state => state.order);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!amazonOrders) return <p className="text-center mt-8 text-gray-500">No orders found.</p>;

  const totalPages = Math.ceil(amazonOrders.length / itemsPerPage);
  const paginatedOrders = amazonOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
console.log(amazonOrders)
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Amazon Orders</h2>

      {loading && (
        <div className="flex justify-center py-10">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>
      )}

      {error && !loading && (
        <p className="text-center text-red-600 font-semibold">{error}</p>
      )}

      {!loading && amazonOrders.length === 0 && (
        <p className="text-center text-gray-500">No orders available.</p>
      )}

      {!loading && amazonOrders.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xl font-semibold text-blue-800 uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xl font-semibold text-blue-800 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xl font-semibold text-blue-800 uppercase tracking-wider"
                  >
                    Payment
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xl font-semibold text-blue-800 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xl font-semibold text-blue-800 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedOrders.map(order => (
                  <tr
                    key={order.AmazonOrderId}
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 max-w-xs truncate font-medium text-gray-900 text-xl">
                      {order.AmazonOrderId}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xl">{order.OrderStatus}</td>
                    <td className="px-4 py-3 text-gray-700 text-xl">{order.PaymentMethod}</td>
                    <td className="px-4 py-3 text-gray-900 font-semibold text-xl">
                      ₹{order.OrderTotal?.Amount}
                    </td>
                    <td className="px-4 py-3 text-right text-xl">
                      <Button
                         variant="outline"
                        onClick={() => navigate(`/amazon-order-detail/${order.AmazonOrderId}`)}
                         className="text-blue-700 hover:text-blue-900 border-blue-700 hover:border-blue-900"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-3 sm:space-y-0">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-5 py-2 bg-blue-100 text-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>

              <p className="text-gray-600 font-medium">
                Page <span className="font-semibold">{currentPage}</span> of{" "}
                <span className="font-semibold">{totalPages}</span>
              </p>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-5 py-2 bg-blue-100 text-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AmazonOrders;
