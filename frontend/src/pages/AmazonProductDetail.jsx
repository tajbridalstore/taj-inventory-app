import { getAmazonProduct } from "@/services/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const AmazonProductDetail = () => {
  const { asin } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getAmazonProduct(asin);
        // console.log(response.data.data)
        if (response?.data) {
          const mainProduct = response.data.data;
          setProduct(mainProduct);

        } else {
          setErrorMsg("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setErrorMsg("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };
  
    if (asin) fetchProduct();
  }, [asin]);
  

  if (loading) return <p className="p-6">Loading product...</p>;
  if (errorMsg) return <p className="p-6 text-red-500">{errorMsg}</p>;
  if (!product) return <p className="p-6">Product not available.</p>;

  // Extract data
  const summary = product.summaries?.[0] || {};
  const attributes = product.attributes || {};
  const brand = attributes.brand?.[0]?.value || summary.brandName || "N/A";
  const manufacturer = attributes.manufacturer?.[0]?.value || summary.manufacturer || "N/A";
  const title = attributes.item_name?.[0]?.value || summary.itemName || "No Title";

  // Extract image array properly
  const allImages = product.images?.[0]?.images || [];
  const mainImage = allImages.find((img) => img.variant === "MAIN") || allImages[0];
console.log(product)
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Amazon Product Detail</h2>

      {/* Product Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 max-w-3xl mx-auto flex flex-col sm:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          {mainImage ? (
            <img
              src={mainImage.link}
              alt={title}
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
            <p className="text-gray-600 text-sm">ASIN</p>
            <p className="font-medium">{product.asin}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Title</p>
            <p className="font-semibold text-lg">{title}</p>
          </div>
          {summary.colorName && (
  <div>
    <p className="text-gray-600 text-sm">Color</p>
    <p className="font-medium">{summary.colorName}</p>
  </div>
)}

{summary.sizeName && (
  <div>
    <p className="text-gray-600 text-sm">Size</p>
    <p className="font-medium">{summary.sizeName}</p>
  </div>
)}

        </div>
      </div>



      {/* Variations */}
      {product.variations?.length > 0 && product.variations[0]?.asins?.length > 0 && (
  <div className="bg-white p-4 rounded-xl shadow-sm max-w-3xl mx-auto mt-6">
    <h3 className="text-lg font-semibold mb-3">Child Variants (ASINs)</h3>
    <ul className="list-disc list-inside space-y-1">
      {product.variations[0].asins.map((variantAsin, index) => (
        <li key={index} className="text-gray-700">
          {variantAsin}
        </li>
      ))}
    </ul>
  </div>
)}
    </div>
  );
};

export default AmazonProductDetail;
