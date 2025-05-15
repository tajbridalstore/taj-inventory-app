import React from 'react'
import ImageUploader from '../ImageUploader'

const ImageFieldsForm = ({setValue,watch,register,variants=""}) => {
  return (
      <div className="px-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
              Product Images
            </h2>
            <div className="grid grid-cols-1  md:grid-cols-3 gap-4">
              {[
                "main_product_image_locator",
                "other_product_image_locator_1",
                "other_product_image_locator_2",
                "other_product_image_locator_3",
                "other_product_image_locator_4",
                "other_product_image_locator_5",
              ].map((field, idx) => (
                <div key={idx} className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-gray-700">
                    {field
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                  <div className="border border-dashed border-gray-300 rounded-lg p-2">
                    <ImageUploader
                      name={variants ? `${variants}.${idx}.${field}` : field}
                      label={field
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      form={{ setValue, watch, register }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
  )
}

export default ImageFieldsForm