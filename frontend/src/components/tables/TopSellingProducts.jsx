import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button'; 

const TopSellingProducts = () => {
 



  return (
    <div className="border-1 border-gray-100 p-4 rounded-2xl shadow">
      <h2 className="text-xl mb-4">Top Selling Products</h2>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="text-xl">ASIN</TableHead>
            <TableHead className="text-xl text-right">Quantity Sold</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
     
            <TableRow>
              <TableCell className="text-xl">asin</TableCell>
              <TableCell className="text-xl text-right">quantity</TableCell>
            </TableRow>
    
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <Button className="bg-blue-600 cursor-pointer">
          Previous
        </Button>
        <p className="text-sm">
          Page {1} of {10}
        </p>
        <Button className="bg-blue-600 cursor-pointer">
          Next
        </Button>
      </div>
    </div>
  );
};

export default TopSellingProducts;
