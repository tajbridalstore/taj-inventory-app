import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { createFeedProduct, createShopifyProduct, getProducts } from "@/services/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input"

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProducts();
        console.log(res)
        if (res && res?.products) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchData();
  }, []);

  const handleShopify = async (sku) => {
    try {
      const response = await createShopifyProduct( sku );
      console.log(response)
      if (response?.success) {
      alert("Product Created on Shopify")
        toast.success("Product created on shopify")
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAmazon = async (sku) => {
    try {
      const response = await createFeedProduct( sku );
      if (response?.success) {
        alert("Product Created on Amazon")
        toast.success("Product created on amazon")
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-full p-4">
      <div className="mb-4 w-full flex gap-2">
      <Input placeholder="search product"/>
        <Link to="/create-product">
          <Button className="cursor-pointer">Create New Product</Button>
        </Link>
      </div>
<div className="overflow-x-auto w-full shadow rounded-2xl">
  
<Table className="min-w-[600px] w-full">
      <TableHeader>
  <TableRow>
    <TableHead>Image</TableHead>
    <TableHead>Title</TableHead>
    <TableHead>SKU</TableHead>
    <TableHead>Status</TableHead>
    <TableHead className="text-right">Actions</TableHead>
  </TableRow>
</TableHeader>
<TableBody>
  {products.length >0 &&products.map((product, idx) => (
    <TableRow key={idx}>
      <TableCell>
        {product.productImage && product.productImage[0] && (
          <img
            src={`http://localhost:8000${product.productImage[0]}`}
            alt={product.title}
            className="w-16 h-16 object-cover rounded"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/fallback-image.png";
            }}
          />
        )}
      </TableCell>
      <TableCell>{product.title}</TableCell>
      <TableCell>{product.sku}</TableCell>
      <TableCell>{product.status || "Draft"}</TableCell>
      <TableCell className="space-y-2 text-right">
        <div>
          <Button className="cursor-pointer" onClick={() => handleShopify(product.sku)}>Add on Shopify</Button>
        </div>
        <div>
          <Button className="cursor-pointer" onClick={() => handleAmazon(product.sku)}>Add on Amazon</Button>
        </div>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

      </Table>
</div>
    </div>
  );
};

export default Products;
