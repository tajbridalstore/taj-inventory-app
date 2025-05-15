import { getAmazonInventory } from '@/services/api';
import React, { useEffect, useState } from 'react'

const AmazonInventory = () => {
    const [inventory,setInventory] = useState([])
      useEffect(() => {
        const fetchInventory = async () => {
   ;
    
          try {
            const response = await getAmazonInventory();
            console.log("Fetched Amazon Inventory:", response);
    
            if (response?.success) {
                setInventory(response.data);
            } else {
              console.log("no inventory found")
            }
          } catch (error) {
            console.error("Error fetching Shopify order:", error);

          } 
        };
    
        fetchInventory()
      }, []);
    
  return (
    <div>AmazonInventory</div>
  )
}

export default AmazonInventory