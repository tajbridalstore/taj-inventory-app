import useGetOrders from '@/hooks/useGetOrders'
import React from 'react'
import { useSelector } from 'react-redux';

const ReplaceOrders = () => {
    useGetOrders();
    const {replacedOrders} = useSelector(state => state.order);
    console.log(replacedOrders)
  return (
    <div>ReplaceOrders</div>
  )
}

export default ReplaceOrders