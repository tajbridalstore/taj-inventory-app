import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";

const TopCitiesTable = () => {
  return (
    <div className="w-full h-full border-1 border-gray-100 p-4 rounded-2xl shadow">
      <h2 className="text-xl mb-4">Top Cities</h2>
      <Table className="w-full h-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px] text-xl">City</TableHead>
            <TableHead className="text-right text-xl">Total Orders</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="text-xl">City</TableCell>
            <TableCell className="text-right text-xl">Count</TableCell>
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

export default TopCitiesTable;

// import React from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// const TopCitiesTable = ({ orders, topN = 10 }) => {
//   const cityPostalCount = {};

//   orders.forEach(order => {
//     const city = order?.ShippingAddress?.City;
//     const postal = order?.ShippingAddress?.PostalCode;

//     if (city && postal) {
//       const key = `${city}__${postal}`; // Combine city and postal for uniqueness
//       cityPostalCount[key] = (cityPostalCount[key] || 0) + 1;
//     }
//   });

//   const sortedCityPostal = Object.entries(cityPostalCount)
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, topN);

//   return (
//     <div className="w-full h-full p-4 bg-blue-50 rounded-2xl my-4">
//       <Table className="w-full h-full table-fixed">
//         <TableHeader>
//           <TableRow>
//             <TableHead>City</TableHead>
//             <TableHead >Postal Code</TableHead>
//             <TableHead className="text-right">Total Orders</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {sortedCityPostal.map(([key, count], index) => {
//             const [city, postal] = key.split('__');
//             return (
//               <TableRow key={index}>
//                 <TableCell className="font-medium">{city}</TableCell>
//                 <TableCell className="font-medium">{postal}</TableCell>
//                 <TableCell className="text-right">{count}</TableCell>
//               </TableRow>
//             );
//           })}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

// export default TopCitiesTable;
