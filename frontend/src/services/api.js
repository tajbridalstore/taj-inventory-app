import axios from 'axios';

export const BASE_URL = `${import.meta.env.VITE_BASE_URL}`;
const API = axios.create({
  baseURL: BASE_URL,
});

// Login function
export const uploadImage = async (email, password) => {
  const response = await API.post(`${BASE_URL}/api/v1/image/upload`, { email, password });
  return response.data;
};

export const createProduct = async (productData) => {
  console.log("Product Data:", productData);  // Log the product data
  const response = await API.post(`${BASE_URL}/api/v1/product/create`, productData,);
  return response.data;
};

export const getProducts = async()=>{
  try {
      const response = await axios.get(`${BASE_URL}/api/v1/product/get-products`)
      return  response.data;
  } catch (error) {
      console.log(error)
  }
};

export const createFeedProduct = async(sku)=>{
  try {
      const response = await axios.post(`${BASE_URL}/api/v1/product/feed-products`,{sku})
      return  response.data;
  } catch (error) {
      console.log(error)
  }
};

export const createShopifyProduct = async(sku)=>{
  try {
      const response = await axios.post(`${BASE_URL}/api/v1/product/create-on-shopify`,{sku})
      return  response.data;
  } catch (error) {
      console.log(error)
  }
};

export const getShopifyProduct = async(productId)=>{
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/product/get-shopify-product/${productId}`);
      return  response.data;
  } catch (error) {
      console.log(error)
  }
};
export const getAmazonProduct = async(asin)=>{
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/product/get-amazon-product/${asin}`);
      return  response;
  } catch (error) {
      console.log(error)
  }
};
// Function to get products with page and limit parameters
export const getAllShopifyProducts = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/product/get-shopify-products`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; // Optional: Re-throw error to handle it at the caller level
  }
};

export const getShopifyInventory = async()=>{
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/inventory/shopify`);
      return  response.data.data;
  } catch (error) {
      console.log(error)
  }
};
     
export const getAmazonInventory = async()=>{
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/inventory/amazon`);
      return  response.data;
  } catch (error) {
      console.log(error)
  }
};
     
// services/api.js

export const fetchAmazonProducts = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/product/get-amazon-products`);
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};


export const getSingleAmazonOrderItem = async (orderId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/order/get-amazon-order/${orderId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const getSingleShopifyOrderItem = async (orderId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/order/get-shopify-order/${orderId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


//////////////////////////////////////////////////////////
// order api 

export const createOrder = async (data)=>{
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/order/create-order`,data,{
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export const fetchAppOrder = async ()=>{
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/order/get-app-orders`,{
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}