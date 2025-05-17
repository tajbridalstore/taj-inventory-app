import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useGetAmazonOrders from '@/hooks/useGetAmazonOrders';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useGetShopifyOrders from '@/hooks/useGetShopifyOrders';
import AppPendingOrdres from './AppPendingOrdres';

const PendingOrders = () => {
  const [shopifyPage, setShopifyPage] = useState(1);
  const itemsPerPage = 10;
  useGetAmazonOrders();
  useGetShopifyOrders();
  const navigate = useNavigate();

  const { amazonPendingOrders = [], shopifyPendingOrders = [] } = useSelector(
    (state) => state.order
  );


  const hasAmazonPending = amazonPendingOrders.length > 0;
  const hasShopifyPending = shopifyPendingOrders.length > 0;
  const totalShopifyPages = Math.ceil(shopifyPendingOrders.length / itemsPerPage);
  const paginatedShopifyOrders = shopifyPendingOrders.slice(
    (shopifyPage - 1) * itemsPerPage,
    shopifyPage * itemsPerPage
  );
console.log(shopifyPendingOrders)
  return (
    <div className="space-y-6">

<AppPendingOrdres />


      {/* Amazon Orders Section */}
      <div className='border-1 border-gray-100 p-4 rounded-xl'>
        <h2 className="text-xl font-semibold">Amazon Pending Orders</h2>
        {hasAmazonPending ? (
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Amazon Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amazonPendingOrders.map((order) => (
                <TableRow key={order.AmazonOrderId}>
                  <TableCell className="font-medium">{order.AmazonOrderId}</TableCell>
                  <TableCell>{order.OrderStatus}</TableCell>
                  <TableCell>{order.PaymentMethod}</TableCell>
                  <TableCell>₹{order.OrderTotal?.Amount ?? '0.00'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() =>
                        navigate(`/amazon-order-detail/${order.AmazonOrderId}`)
                      }
                    >
                      View Item
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 mt-2">No Pending Amazon Orders</p>
        )}
      </div>

      {/* Shopify Orders Section */}
      <div className='border-1 border-gray-100 p-4 rounded-xl'>
        <h2 className="text-xl font-semibold">Shopify Pending Orders</h2>
        {hasShopifyPending ? (
          <>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Shopify Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Gateway</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedShopifyOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.name}</TableCell>
                    <TableCell>{order.financial_status}</TableCell>
                    <TableCell>{order.gateway}</TableCell>
                    <TableCell>₹{order.total_price}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() =>
                          navigate(`/shopify-order-detail/${order.id}`)
                        }
                      >
                        View Item
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex justify-end items-center gap-4 mt-4">
              <Button
                disabled={shopifyPage === 1}
                onClick={() => setShopifyPage(shopifyPage - 1)}
              >
                Previous
              </Button>
              <span>Page {shopifyPage} of {totalShopifyPages}</span>
              <Button
                disabled={shopifyPage === totalShopifyPages}
                onClick={() => setShopifyPage(shopifyPage + 1)}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 mt-2">No Pending Shopify Orders</p>
        )}
      </div>

    </div>
  );
};

export default PendingOrders;
