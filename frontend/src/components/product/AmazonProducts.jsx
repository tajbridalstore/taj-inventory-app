import React, { useState, useEffect } from "react";
import { fetchAmazonProducts } from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AmazonProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    console.log('call')
    try {
      setLoading(true);
      const response = await fetchAmazonProducts();
      console.log("Products fetched:", response.data);
      setProducts(response.data.products || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="w-full p-4">
      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && products.length > 0 && (
        <Table className="w-full table-fixed bg-blue-50 rounded-2xl p-4">
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>ASIN</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
  {products.map((product) => {
    const summary = product.summaries?.[0] || {};
    return (
      <TableRow key={product.sku}>
        <TableCell>
          {summary.mainImage?.link ? (
            <img
              src={summary.mainImage.link}
              alt={product.sku}
              className="h-12 w-12 object-contain rounded-md"
            />
          ) : (
            <span>N/A</span>
          )}
        </TableCell>
        <TableCell>{product.sku}</TableCell>
        <TableCell>{summary.asin || "N/A"}</TableCell>
        <TableCell>{summary.itemName || "N/A"}</TableCell>
        <TableCell>{summary.brand || "N/A"}</TableCell>
        <TableCell>{product.fulfillmentAvailability?.[0]?.quantity ?? "N/A"}</TableCell>
        <TableCell>{product.productType || "N/A"}</TableCell>
      </TableRow>
    );
  })}
</TableBody>

        </Table>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-center text-gray-500">No products found.</p>
      )}
    </div>
  );
};

export default AmazonProducts;
