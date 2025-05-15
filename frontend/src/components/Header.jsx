import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router';
import { getAmazonProduct, getShopifyProduct, getSingleAmazonOrderItem, getSingleShopifyOrderItem } from '@/services/api';


const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
  
    setLoading(true);
  
    const safeCall = async (fn) => {
      try {
        const result = await fn(trimmedQuery);
        return result;
      } catch (err) {
        return null;
      }
    };
  
    const amazonOrder = await safeCall(getSingleAmazonOrderItem);
    if (amazonOrder) {
      navigate(`/amazon-order-detail/${trimmedQuery}`);
      setSearchQuery('');
      setLoading(false);
      return;
    }
  
    const shopifyOrder = await safeCall(getSingleShopifyOrderItem);
    if (shopifyOrder) {
      navigate(`/shopify-order-detail/${trimmedQuery}`);
      setSearchQuery('');
      setLoading(false);
      return;
    }
  
    const shopifyProduct = await safeCall(getShopifyProduct);
    if (shopifyProduct) {
      navigate(`/shopify-product-detail/${trimmedQuery}`);
      setSearchQuery('');
      setLoading(false);
      return;
    }
  
    const amazonProduct = await safeCall(getAmazonProduct);
    if (amazonProduct) {
      navigate(`/amazon-product-detail/${trimmedQuery}`);
      setSearchQuery('');
      setLoading(false);
      return;
    }
  
    alert('No order or product found with this ID.');
    setLoading(false);
  };
  
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <header className='flex items-center justify-between bg-[#5e0659] text-white p-3'>
      <h1 className='text-xl'>Taj Store</h1>

      <div className='flex gap-2'>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Search order ID (Amazon or Shopify)'
          className="placeholder:text-white w-64"
        />
        <Button
          className="bg-white text-black px-8 hover:bg-white cursor-pointer"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </header>
  );
};

export default Header;
