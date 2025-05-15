import React from 'react'
import CardField from '@/components/cards/CardField'
import TopSellingProducts from '@/components/tables/TopSellingProducts'
import TopCitiesTable from '@/components/tables/TopCitiesTable'
import useGetShopifyOrders from '@/hooks/useGetShopifyOrders'


const Home = () => {
useGetShopifyOrders();

  return (
   <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
     <CardField  className='bg-green-200 cursor-pointer' title="Pending Orders" link="pending-orders"/>
     <CardField  className='bg-yellow-200 cursor-pointer' title="Low stock Products" link="inventory"/>
     <CardField  className='bg-red-300 cursor-pointer' title="Out of stcok Products" link="pending-orders"/>
     <CardField  className='bg-amber-500 cursor-pointer' title="App Orders" link="pending-orders"/>
     <CardField  className='bg-cyan-200 cursor-pointer' title="Amazon Orders" link="amazon-orders"/>
     <CardField  className='bg-fuchsia-300 cursor-pointer' title="Shopify Orders" link="shopify-orders"/>
     <CardField  className='bg-fuchsia-300 cursor-pointer' title="Amazon Products" link="amazon-products"/>
     <CardField  className='bg-fuchsia-300 cursor-pointer' title="Shopify Products" link="shopify-products"/>
    </div>
    <div className='grid  md:grid-cols-2  gap-4'>
    <TopSellingProducts />
    <TopCitiesTable />
    </div>
   </div>
  )
}

export default Home