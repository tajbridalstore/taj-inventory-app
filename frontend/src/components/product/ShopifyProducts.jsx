import React, { useEffect, useState } from 'react';
import { getAllShopifyProducts } from '@/services/api'; // Assuming this function handles pagination in the backend
import { toast } from 'sonner';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

const ShopifyProducts = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);  // Current page state
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);  // Limit per page (10)

  // Fetch products when page or limit changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllShopifyProducts(page, limit);  // Get products based on page and limit
        console.log("Products fetched:", response);
        setProducts(response.products);
        setTotalCount(response.totalCount);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      }
    };

    fetchProducts();  // Call fetch when page or limit changes
  }, [page, limit]);

  const totalPages = Math.ceil(totalCount / limit);  // Calculate total pages based on total count and limit

  // Next page handler
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);  // Go to the next page
    }
  };

  // Previous page handler
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);  // Go to the previous page
    }
  };

  // Handle limit change (e.g., number of items per page)
  const handleLimitChange = (newLimit) => {
    setLimit(parseInt(newLimit));  // Change the limit (items per page)
    setPage(1);  // Reset page to 1 when limit changes
  };

  return (
    <div className="container mx-auto py-10 border border-gray-200 rounded-2xl p-4">
      <h1 className="text-3xl font-bold mb-6">Shopify Products</h1>

      <ScrollArea>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].src}
                      alt={product.title}
                      className="h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <span className="text-muted-foreground">No Image</span>
                  )}
                </TableCell>
                <TableCell>{product.title}</TableCell>
                <TableCell>
                  {product.variants && product.variants.length > 0 ? product.variants[0].sku : 'N/A'}
                </TableCell>
                <TableCell>
                  {product.variants && product.variants.length > 0 ? `₹${product.variants[0].price}` : 'N/A'}
                </TableCell>
                <TableCell className="text-right capitalize">{product.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="py-4 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button onClick={handlePrevPage} disabled={page === 1} variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button onClick={handleNextPage} disabled={page === totalPages} variant="outline">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ShopifyProducts;
