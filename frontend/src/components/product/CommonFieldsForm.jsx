import React from 'react'
import { useForm, useFieldArray } from "react-hook-form";
const CommonFieldsForm = ({register, name, control}) => {
  const {
    fields: relatedSkuFields,
    append: appendRelatedSku,
    remove: removeRelatedSku,
  } = useFieldArray({
    control,
    name: name,
  });
  return (
    <div className="mb-8">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Fields</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md border border-gray-300">
      <label className="flex flex-col">
        Product Title
        <input
          {...register("productTitle", { required: "Product Title is required" })}
          className="p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
      <label className="flex flex-col">
        Parent SKU
        <input
          {...register("sku", { required: "Sku is required" })}
          className="p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

              
      <label className="flex flex-col">
  Product Image
  <input
    type="file"
    accept="image/*"
    {...register("productImage", {
      required: true,
    })}
    className="p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</label>


    </div>
  </div>
  )
}

export default CommonFieldsForm