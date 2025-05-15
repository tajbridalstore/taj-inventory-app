import { Route, Routes } from 'react-router'
import Layout from './layout/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import CreateProduct from './components/product/CreateProduct'
import AmazonOrderDetail from './pages/AmazonOrderDetail'
import ShopifyOrderDetail from './pages/ShopifyOrderDetail'
import Orders from './pages/Orders'
import PendingOrders from './pages/PendingOrders'
import CreateOrder from './pages/CreateOrder'
import ShopifyProductDetail from './pages/ShopifyProductDetail'
import AmazonProductDetail from './pages/AmazonProductDetail'
import AmazonInventory from './components/inventory/AmazonInventory'
import AmazonOrdersPage from './pages/AmazonOrdersPage'
import ShopifyOrdersPage from './pages/ShopifyOrdersPage'
import AmazonProducts from './components/product/AmazonProducts'
import ShopifyProducts from './components/product/ShopifyProducts'
import MenifestOrders from './pages/MenifestOrders'
import IntransitOrders from "./pages/IntransitOrders";
import OrderDetails from './pages/OrderDetails'
import DispatchOrder from './pages/DispatchOrder'
import DeliveredOrders from './pages/DeliveredOrders'
import CancelOrders from './pages/CancelOrders'
import ReplaceOrders from './pages/ReplaceOrders'


function App() {


  return (
    <>
     <Routes>
      <Route path='/' element={<Layout />} >
      
        <Route index element={<Home />} />
        <Route path='products' element={<Products />} />
        <Route path='amazon-products' element={<AmazonProducts />} />
        <Route path='shopify-products' element={<ShopifyProducts />} />
        <Route path='shopify-product-detail/:productId' element={<ShopifyProductDetail />} />
        <Route path='amazon-product-detail/:asin' element={<AmazonProductDetail />} />
        <Route path='orders' element={<Orders />} />
        <Route path='order-details/:orderId' element={<OrderDetails/>} />
        <Route path='amazon-orders' element={<AmazonOrdersPage />} />
        <Route path='shopify-orders' element={<ShopifyOrdersPage />} />
        <Route path='pending-orders' element={<PendingOrders />} />
        <Route path='create-order' element={<CreateOrder />} />
        <Route path='create-product' element={<CreateProduct />} />
        <Route path='amazon-order-detail/:orderId' element={<AmazonOrderDetail />} />
        <Route path='shopify-order-detail/:orderId' element={<ShopifyOrderDetail />} />
        <Route path='inventory' element={<AmazonInventory />} />
        <Route path='menifest-orders' element={<MenifestOrders />} />
        <Route path='intransit-orders' element={<IntransitOrders />} />
        <Route path='dispatch-orders' element={<DispatchOrder />} />
        <Route path='delivered-orders' element={<DeliveredOrders />} />
        <Route path='cancel-orders' element={<CancelOrders />} />
        <Route path='replace-orders' element={<ReplaceOrders />} />

      </Route>
     </Routes>
    </>
  )
}

export default App
