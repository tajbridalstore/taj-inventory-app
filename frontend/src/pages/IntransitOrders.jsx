// In your intransitOrders.jsx (or whatever the file name is)
import React, { useEffect } from 'react';

const IntransitOrders = () => {
  useEffect(() => {
    console.log('IntransitOrders component mounted');
  }, []);

  return (
    <div>intransitOrders</div>
  );
};

export default IntransitOrders;