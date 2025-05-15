import { Home,LayoutGrid,ShoppingBag,Package,ClipboardList,Receipt,Users  } from "lucide-react";

export const MenuItems = [
    {
       name:"Home",
       path:"/",
       icon:Home
    },
    {
        name:"Inventory",
        icon:ClipboardList,
        path:"/",
        submenu:[
             {
                name:"Add Product",
                path:"/create-product",
                icon:ShoppingBag
             },
             {
                name:"Add Order",
                path:"/create-order",
                icon:Package
             },
        ]
     },
     {
        name:"Products",
        path:"/products",
        icon:ShoppingBag
     },
     {
        name:"Orders",
        path:"/orders",
        icon:Package 
     },
     {
      name:"Pending Orders",
      path:"/pending-orders",
      icon:Package 
   },
     {
      name:"Menifest Orders",
      path:"/menifest-orders",
      icon:Package 
   },
   {
      name:"Dispatched Orders",
      path:"/dispatch-orders",
      icon:Package 
   },
   {
      name:"Delivered Orders",
      path:"/delivered-orders",
      icon:Package 
   },
    {
      name:"Cancel Orders",
      path:"/cancel-orders",
      icon:Package 
   },
     {
      name:"Replace Orders",
      path:"/replace-orders",
      icon:Package 
   }
]