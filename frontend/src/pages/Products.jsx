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
import {
  createFeedProduct,
  createShopifyProduct,
  getProducts,
} from "@/services/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/Spinner";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loadingShopify, setLoadingShopify] = useState(null);
  const [loadingAmazon, setLoadingAmazon] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProducts();
        console.log(res);
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
    setLoadingShopify(sku);
    try {
      const response = await createShopifyProduct(sku);
      if (response?.success) {
        toast.success("Product created on Shopify");
        alert("Product Created on Shopify");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingShopify(null);
    }
  };

  const handleAmazon = async (sku) => {
    setLoadingAmazon(sku);
    try {
      const response = await createFeedProduct(sku);
      if (response?.success) {
        toast.success("Product created on Amazon");
        alert("Product Created on Amazon");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAmazon(null);
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="mb-4 w-full flex gap-2">
        <Input placeholder="search product" />
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
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 &&
              products.map((product, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {product.productImage && product.productImage[0] && (
                      <img
                        src={`https://api.inventorytaj.in${product.productImage[0]}`}
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
                  {product.variants.map((variant) => (
                    <TableCell>{variant.quantity}</TableCell>
                  ))}

                  <TableCell className="space-y-2 text-right">
                    <div>
                      <Button
                        className="cursor-pointer w-full flex justify-center"
                        onClick={() => handleShopify(product.sku)}
                        disabled={loadingShopify === product.sku}
                      >
                        {loadingShopify === product.sku ? (
                          <Spinner />
                        ) : (
                          "Add on Shopify"
                        )}
                      </Button>
                    </div>
                    <div>
                      <Button
                        className="cursor-pointer w-full flex justify-center"
                        onClick={() => handleAmazon(product.sku)}
                        disabled={loadingAmazon === product.sku}
                      >
                        {loadingAmazon === product.sku ? (
                          <Spinner />
                        ) : (
                          "Add on Amazon"
                        )}
                      </Button>
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
