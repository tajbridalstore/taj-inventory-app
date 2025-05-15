import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getShopifyProduct } from '@/services/api';

const ShopifyProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getShopifyProduct(productId);
        if (data) {
          setProduct(data.product);
        } else {
          setErrorMsg('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setErrorMsg('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  if (loading) return <p className="p-6">Loading product...</p>;
  if (errorMsg) return <p className="p-6 text-red-500">{errorMsg}</p>;
  if (!product) return <p className="p-6">Product not available.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Shopify Product Detail</h2>

      {/* Product Main Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 max-w-3xl mx-auto flex flex-col sm:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          {product.image?.src ? (
            <img
              src={product.image.src}
              alt={product.title}
              className="w-32 h-32 object-cover rounded-xl border"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-200 text-sm rounded-xl">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <p className="text-gray-600 text-sm">Product ID</p>
            <p className="font-medium">{product.id}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Title</p>
            <p className="font-semibold text-lg">{product.title}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Vendor</p>
            <p className="font-medium">{product.vendor}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Status</p>
            <p className="font-medium capitalize">{product.status}</p>
          </div>
        </div>
      </div>

      {/* Optional Variants Section */}
      {product.variants.map((variant) => (
  <div
    key={variant.id}
    className="p-4 bg-gray-50 border rounded-xl shadow-sm"
  >
    <p className="text-sm text-gray-500">Variant ID: {variant.id}</p>
    <p className="font-medium">Title: {variant.title || 'N/A'}</p>
    <p className="text-green-600 font-semibold">Price: ₹{variant.price}</p>
    <p className="text-sm text-gray-600">SKU: {variant.sku || 'N/A'}</p>

    {/* ✅ Stock availability */}
    <p className={`font-semibold ${variant.inventory_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
      {variant.inventory_quantity > 0
        ? `In Stock (${variant.inventory_quantity})`
        : 'Out of Stock'}
    </p>
  </div>
))}

    </div>
  );
};

export default ShopifyProductDetail;
