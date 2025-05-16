import { getProducts } from '@/services/api';
import React, { useState, useEffect } from 'react';

const SearchProduct = () => {
  const [products, setProducts] = useState([]);

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

  return (
    <div>
      <h2>Product Variants Details</h2>
      {products.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Variant Image</th>
              <th>Size</th>
              <th>Color</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <React.Fragment key={product._id}>
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map((variant, index) => (
                    <tr key={`${product._id}-${index}`}>
                      <td>{product.title}</td>
                      <td>
                        {variant.main_product_image_locator &&
                          variant.main_product_image_locator[0]?.media_location && (
                            <img
                              src={variant.main_product_image_locator[0].media_location}
                              alt={`${product.title} - ${variant.sku}`}
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          )}
                      </td>
                      <td>{variant.size && variant.size[0]?.value}</td>
                      <td>{variant.color && variant.color[0]?.value}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>{product.title} (No Variants)</td>
                    <td>
                      {product.productImage && product.productImage[0] && (
                        <img
                          src={product.productImage[0]}
                          alt={product.title}
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      )}
                    </td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
};

export default SearchProduct;