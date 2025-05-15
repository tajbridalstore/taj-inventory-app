const Product = require("../models/product.model");
const staticData = require("../utils/staticData");
const NodeCache = require("node-cache");
const productCache = new NodeCache(); // cache for 5 minutes (300 sec)
const axios = require("axios");
const getAccessToken = require("../utils/genarateToken");
const ALL_PRODUCTS_CACHE_KEY = 'allShopifyProducts';
const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Check if a product with the same SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      return res.status(400).json({
        message: "Product with this SKU already exists",
        success: false,
      });
    }
     const meragedData = { ...staticData, ...productData };
    const newProduct = new Product(meragedData);
    const savedProduct = await newProduct.save();
  // ✅ Invalidate product list cache
   console.log("savedProduct",savedProduct)
    res.status(201).json({
      message: "Product created successfully",
      success: true,
      data: savedProduct,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({
      message: "Error creating product",
      success: false,
      error: error.response ? error.response.data : error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {



    const products = await Product.find();

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
        success: false,
      });
    }



    res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    res.status(500).json({
      message: "Error fetching products",
      success: false,
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    // ✅ Invalidate cache
    productCache.del("products");

    res.status(200).json({
      message: "Product updated successfully",
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({
      message: "Error updating product",
      success: false,
      error: error.message,
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    // ✅ Invalidate cache
    productCache.del("products");

    res.status(200).json({
      message: "Product deleted successfully",
      success: true,
      data: deletedProduct,
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({
      message: "Error deleting product",
      success: false,
      error: error.message,
    });
  }
};


const createProductOnShopify = async (req, res) => {
  try {
    const { sku } = req.body;

    const product = await Product.findOne({ sku });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not Found." });
    }

    // Step 1: Collect the main (global) product image
    const mainProductImageUrl = product.main_product_image_locator?.[0]?.media_location;
    const mainProductImages = mainProductImageUrl
      ? [{ src: mainProductImageUrl }]
      : [];

    // Step 2: Prepare Shopify variants
    const variants = product.variants.map((variant) => ({
      option1: variant.size?.[0]?.value || "Default",
      option2: variant.color?.[0]?.value || "Default",
      price: variant.price,
      compare_at_price: variant.compare_at_price || undefined,
      sku: variant.sku,
      inventory_quantity: variant.inventory_quantity || 0,
    }));

    // Step 3: Build options based on variant attributes
    const options = [];
    if (variants.some((v) => v.option1 !== "Default")) options.push({ name: "Size" });
    if (variants.some((v) => v.option2 !== "Default")) options.push({ name: "Color" });

    // Step 4: Prepare metafields based on your requirements
    const metafieldsToAdd = [
      {
        namespace: "category",
        key: "main",
        value: "Jewelry", // You might want to make this dynamic based on your product data
        type: "string",
      },
      {
        namespace: "category",
        key: "sub",
        value: "Bracelets", // Make this dynamic if needed
        type: "string",
      },
      {
        namespace: "category",
        key: "color",
        value: product.color?.map(c => c.value) || [], // Assuming product.color is an array of objects with a 'value' property
        type: "json_string",
      },
      {
        namespace: "category",
        key: "fabric",
        value: product.fabric?.[0]?.value || "Other", // Adjust based on your data structure
        type: "string",
      },
      {
        namespace: "category",
        key: "jewelry_material",
        value: product.jewelry_material?.[0]?.value || "Lac", // Adjust based on your data structure
        type: "string",
      },
      {
        namespace: "category",
        key: "age_group",
        value: product.age_group?.[0]?.value || "Adults", // Adjust based on your data structure
        type: "string",
      },
      {
        namespace: "category",
        key: "bracelet_design",
        value: product.bracelet_design?.[0]?.value || "Bangle", // Adjust based on your data structure
        type: "string",
      },
      {
        namespace: "category",
        key: "jewelry_type",
        value: product.jewelry_type?.[0]?.value || "Imitation jewelry", // Adjust based on your data structure
        type: "string",
      },
      {
        namespace: "category",
        key: "target_gender",
        value: product.target_gender?.[0]?.value || "Female", // Adjust based on your data structure
        type: "string",
      },
    ];

    // Step 5: Create product on Shopify including metafields
    const createRes = await axios.post(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/products.json`,
      {
        product: {
          title: product.title,
          body_html: "",
          vendor: "Taj Bridal Store",
          product_type: product.product_type || "Bracelets",
          tags: product.tags || "",
          status: "draft",
          images: mainProductImages, // Only the main product image(s)
          variants,
          options,
          // metafields: metafieldsToAdd,
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const createdProduct = createRes.data.product;

    // Step 6: Map Shopify variant IDs by SKU
    const variantIdMap = {};
    createdProduct.variants.forEach((v) => {
      variantIdMap[v.sku] = v.id;
    });

    // Step 7: Dynamically find and upload variant-specific images and set the main image
    for (const variant of product.variants) {
      const shopifyVariantId = variantIdMap[variant.sku];
      if (!shopifyVariantId) continue;

      const uploadedImageIds = [];
      let mainVariantImageId = null;
      const mainVariantImageUrl = variant.main_product_image_locator?.[0]?.media_location;

      const potentialImageFields = [
        "main_product_image_locator",
        "other_product_image_locator_1",
        "other_product_image_locator_2",
        "other_product_image_locator_3",
        "other_product_image_locator_4",
        "other_product_image_locator_5",
      ];

      for (const field of potentialImageFields) {
        const rawUrl = variant[field]?.[0]?.media_location;

        if (!rawUrl) {
          continue;
        }

        try {
          const urlCheck = await axios.get(rawUrl);
          if (urlCheck.status !== 200) {
            console.log(`❌ Image URL not accessible: ${rawUrl}`);
            continue;
          }

          const uploadRes = await axios.post(
            `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/products/${createdProduct.id}/images.json`,
            {
              image: {
                src: rawUrl,
                variant_ids: [shopifyVariantId],
              },
            },
            {
              headers: {
                "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
                "Content-Type": "application/json",
              },
            }
          );

          const uploadedImage = uploadRes.data.image;
          uploadedImageIds.push(uploadedImage.id);

          // Check if this uploaded image is the main variant image
          if (rawUrl === mainVariantImageUrl) {
            mainVariantImageId = uploadedImage.id;
          }
        } catch (error) {
          console.error(`❌ Failed to upload image for variant ${variant.sku} from ${field}:`, error.response?.data || error.message);
        }
      }

      // Step 8: Update the variant with the main image ID
      if (mainVariantImageId) {
        try {
          await axios.put(
            `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/variants/${shopifyVariantId}.json`,
            {
              variant: {
                image_id: mainVariantImageId,
              },
            },
            {
              headers: {
                "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(`✅ Set main image ${mainVariantImageId} for variant ${variant.sku}`);
        } catch (error) {
          console.error(`❌ Failed to set main image for variant ${variant.sku}:`, error.response?.data || error.message);
        }
      }
    }

    res.status(200).json({ success: true, product: createdProduct });
  } catch (err) {
    console.error("❌ Shopify error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Failed to create product", error: err.message });
  }
};



// const createProductOnShopify = async (req, res) => {
//   try {
//     const { sku } = req.body;

//     const product = await Product.findOne({ sku });
//     console.log(product);
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not Found." });
//     }

//     // Step 1: Collect the main (global) product image
//     const mainProductImageUrl = product.main_product_image_locator?.[0]?.media_location;
//     const mainProductImages = mainProductImageUrl
//       ? [{ src: mainProductImageUrl }]
//       : [];

//     // Step 2: Prepare Shopify variants
//     const variants = product.variants.map((variant) => ({
//       option1: variant.size?.[0]?.value || "Default",
//       option2: variant.color?.[0]?.value || "Default",
//       price: variant.price,
//       compare_at_price: variant.compare_at_price || undefined,
//       sku: variant.sku,
//       inventory_quantity: variant.inventory_quantity || 0,
//     }));

//     // Step 3: Build options based on variant attributes
//     const options = [];
//     if (variants.some((v) => v.option1 !== "Default")) options.push({ name: "Size" });
//     if (variants.some((v) => v.option2 !== "Default")) options.push({ name: "Color" });

//     // Step 4: Prepare metafields based on your requirements
//     const metafieldsToAdd = [
//       {
//         namespace: "category",
//         key: "main",
//         value: "Jewelry", // You might want to make this dynamic based on your product data
//         type: "string",
//       },
//       {
//         namespace: "category",
//         key: "sub",
//         value: "Bracelets", // Make this dynamic if needed
//         type: "string",
//       },
//       {
//         namespace: "category",
//         key: "color",
//         value: product.color?.map(c => c.value) || [], // Assuming product.color is an array of objects with a 'value' property
//         type: "json_string",
//       },
//       {
//         namespace: "category",
//         key: "fabric",
//         value: product.fabric?.[0]?.value || "Other", // Adjust based on your data structure
//         type: "string",
//       },
//       {
//         namespace: "category",
//         key: "jewelry_material",
//         value: product.jewelry_material?.[0]?.value || "Lac", // Adjust based on your data structure
//         type: "string",
//       },
//       {
//         namespace: "category",
//         key: "age_group",
//         value: product.age_group?.[0]?.value || "Adults", // Adjust based on your data structure
//         type: "string",
//       },
//       {
//         namespace: "category",
//         key: "bracelet_design",
//         value: product.bracelet_design?.[0]?.value || "Bangle", // Adjust based on your data structure
//         type: "string",
//       },
//       {
//         namespace: "category",
//         key: "jewelry_type",
//         value: product.jewelry_type?.[0]?.value || "Imitation jewelry", // Adjust based on your data structure
//         type: "string",
//       },
//       {
//         namespace: "category",
//         key: "target_gender",
//         value: product.target_gender?.[0]?.value || "Female", // Adjust based on your data structure
//         type: "string",
//       },
//     ];

//     // Step 5: Create product on Shopify including metafields
//     const createRes = await axios.post(
//       `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/products.json`,
//       {
//         product: {
//           title: product.title,
//           body_html: "",
//           vendor: "Taj Bridal Store",
//           product_type: product.product_type || "Bracelets",
//           tags: product.tags || "",
//           status: "draft",
//           images: mainProductImages, // Only the main product image(s)
//           variants,
//           options,
//           metafields: metafieldsToAdd, // Add the metafields here
//         },
//       },
//       {
//         headers: {
//           "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
//           "Content-Type": "application/json",
//         },
//       }
//     );

    

//     const createdProduct = createRes.data.product;

//     // Step 6: Map Shopify variant IDs by SKU
//     const variantIdMap = {};
//     createdProduct.variants.forEach((v) => {
//       variantIdMap[v.sku] = v.id;
//     });

//     // Step 7: Dynamically find and upload variant-specific images and set the main image
//     for (const variant of product.variants) {
//       const shopifyVariantId = variantIdMap[variant.sku];
//       if (!shopifyVariantId) continue;

//       const uploadedImageIds = [];
//       let mainVariantImageId = null;
//       const mainVariantImageUrl = variant.main_product_image_locator?.[0]?.media_location;

//       const potentialImageFields = [
//         "main_product_image_locator",
//         "other_product_image_locator_1",
//         "other_product_image_locator_2",
//         "other_product_image_locator_3",
//         "other_product_image_locator_4",
//         "other_product_image_locator_5",
//       ];

//       for (const field of potentialImageFields) {
//         const rawUrl = variant[field]?.[0]?.media_location;

//         if (!rawUrl) {
//           continue;
//         }

//         try {
//           const urlCheck = await axios.get(rawUrl);
//           if (urlCheck.status !== 200) {
//             console.log(`❌ Image URL not accessible: ${rawUrl}`);
//             continue;
//           }

//           const uploadRes = await axios.post(
//             `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/products/${createdProduct.id}/images.json`,
//             {
//               image: {
//                 src: rawUrl,
//                 variant_ids: [shopifyVariantId],
//               },
//             },
//             {
//               headers: {
//                 "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
//                 "Content-Type": "application/json",
//               },
//             }
//           );

//           const uploadedImage = uploadRes.data.image;
//           uploadedImageIds.push(uploadedImage.id);

//           // Check if this uploaded image is the main variant image
//           if (rawUrl === mainVariantImageUrl) {
//             mainVariantImageId = uploadedImage.id;
//           }
//         } catch (error) {
//           console.error(`❌ Failed to upload image for variant ${variant.sku} from ${field}:`, error.response?.data || error.message);
//         }
//       }

//       // Step 8: Update the variant with the main image ID
//       if (mainVariantImageId) {
//         try {
//           await axios.put(
//             `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/variants/${shopifyVariantId}.json`,
//             {
//               variant: {
//                 image_id: mainVariantImageId,
//               },
//             },
//             {
//               headers: {
//                 "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//           console.log(`✅ Set main image ${mainVariantImageId} for variant ${variant.sku}`);
//         } catch (error) {
//           console.error(`❌ Failed to set main image for variant ${variant.sku}:`, error.response?.data || error.message);
//         }
//       }
//     }

//     // Clear the cache after successfully creating a product
//     productCache.del(ALL_PRODUCTS_CACHE_KEY);
//     console.log('✅ Product cache cleared after creating a new product.');

//     res.status(200).json({ success: true, product: createdProduct });
//   } catch (err) {
//     console.error("❌ Shopify error:", err.response?.data || err.message);
//     res.status(500).json({ success: false, message: "Failed to create product", error: err.message });
//   }
// };


const getShopifyProduct = async (req, res) => {
  const {productId} = req.params; // Assuming you're fetching by product ID from the route
console.log(productId)
  try {
    // Check if the product exists in the cache
    const cachedProduct = productCache.get(productId);

    if (cachedProduct) {
      console.log(`Serving product ${productId} from cache`);
      return res.json(cachedProduct);
    }

    // If not in cache, fetch from Shopify API
    const response = await axios.get(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/products/${productId}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    const product = response.data;

    // Store the fetched product in the cache (you might want to set an expiry)
    productCache.set(productId, product);
    console.log(`Fetched and cached product ${productId}`);
    res.status(200).json({
      success:true,
      message:"produtc serach seccuessfully",
      product
    });

  } catch (error) {
    console.error(
      "Error fetching product:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

const getAllShopifyProducts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const startIndex = (page - 1) * limit;  // Calculate the start index
  const endIndex = startIndex + parseInt(limit);  // Calculate the end index

  try {
    let allProducts = productCache.get(ALL_PRODUCTS_CACHE_KEY);

    if (!allProducts) {
      console.log('Fetching all Shopify products from API...');
      let fetchedProducts = [];
      let nextPageUrl = `https://${process.env.SHOPIFY_STORE}/admin/api/2025-04/products.json?limit=250`;

      while (nextPageUrl) {
        const response = await axios.get(nextPageUrl, {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        });

        const products = response.data.products;

        if (products && products.length > 0) {
          fetchedProducts = fetchedProducts.concat(products);
        } else {
          break;
        }

        const linkHeader = response.headers.link;
        nextPageUrl = null;

        if (linkHeader) {
          const links = linkHeader.split(', ');
          const nextLink = links.find((link) => link.includes('rel="next"'));
          if (nextLink) {
            const match = nextLink.match(/<(.*?)>/);
            if (match && match[1]) {
              nextPageUrl = match[1];
            }
          }
        }
      }

      fetchedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      productCache.set(ALL_PRODUCTS_CACHE_KEY, fetchedProducts, 3600);
      allProducts = fetchedProducts;
    }

    // Ensure the slicing logic happens correctly
    const paginatedProducts = allProducts.slice(startIndex, endIndex);  // Slice based on current page and limit

    res.json({
      products: paginatedProducts,
      currentPage: parseInt(page),
      limit: parseInt(limit),
      totalCount: allProducts.length,
    });

  } catch (error) {
    console.error('Error fetching or serving Shopify products:', error);
    res.status(500).json({ error: 'Failed to fetch or serve Shopify products' });
  }
};


const getAmazonProduct = async (req, res) => {
  const { asin } = req.params;
  const accessToken = await getAccessToken();
console.log(accessToken)
  try {
    // Step 1: Fetch parent ASIN
    const parentRes = await axios.get(
      `https://${process.env.CATLOG_API}/${asin}?marketplaceIds=A21TJRUUN4KGV&includedData=summaries,images,variations`,
      {
        headers: {
          "x-amz-access-token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(parentRes)   
    res.json({
      success: true,
      message: "Parent fetched",
      data: parentRes.data,
    });

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};



module.exports = { createProduct,getAllProducts,updateProduct,deleteProduct,createProductOnShopify,getShopifyProduct,getAllShopifyProducts,getAmazonProduct };
