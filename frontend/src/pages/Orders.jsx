import AmazonOrders from '@/components/order/AmazonOrders'
import AppOrder from '@/components/order/AppOrder'
import ShopifyOrders from '@/components/order/ShopifyOrders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'
import { Link} from 'react-router'

const Orders = () => {
 
  return (
    <div>
       <div className="mb-6 w-full flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <Input placeholder="Search order..." className="w-full" />
        <Link to="/create-order">
          <Button className="w-full sm:w-auto cursor-pointer">Create New Order</Button>
        </Link>
      </div>
      <div className='border-b-2 border-gray-100 pb-2'>
       <AppOrder />
      </div>
      <div className='border-b-2 border-gray-100 pb-2'>
        <h2>Amazon Orders</h2>
        {/* <AmazonOrders /> */}
      </div>
      <div className='border-b-2 border-gray-100 pb-2'>
        <h2>Shopify Orders</h2>
        {/* <ShopifyOrders /> */}
      </div>
    </div>
  )
}

export default Orders