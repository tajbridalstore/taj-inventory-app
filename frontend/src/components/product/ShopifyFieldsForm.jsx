import React from 'react'

const ShopifyFieldsForm = ({register}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-green-800 mb-4">Shopify Fields</h3>
      <div className="bg-green-50 p-4 rounded-md border border-green-300 space-y-4">
        <label className="flex flex-col">
          Shopify Item Name
          <input
            {...register("title", { required: "Title is required" })}
            className="p-2 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </label>
        <label className="flex flex-col">
          Product Type
          <input
            {...register("product_type")}
            className="p-2 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </label>
    
        <label className="flex flex-col">
          Tags
          <input
            {...register("tags")}
            className="p-2 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </label>
      </div>
    </div>
  )
}

export default ShopifyFieldsForm