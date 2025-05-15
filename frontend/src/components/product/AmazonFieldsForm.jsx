import React from "react";

const AmazonFieldsForm = ({
  register,
  bulletPoints,
  appendBullet,
  removeBullet,
}) => {
  const metalTypeOptions = [
    "Alloy Steel",
    "Aluminium",
    "Brass",
    "Bronze",
    "Copper",
    "Iron",
    "Nickel",
    "No Metal Type",
    "Palladium",
    "Pewter",
    "Platinum",
    "Rose Gold",
    "Silver",
    "Stainless Steel",
    "Sterling Silver",
    "Titanium",
    "Tungsten",
    "Tungsten Carbide",
    "White Gold",
    "Yellow Gold",
    "Zinc",
  ];

  const metalsOptions = [
    "Alloy Steel",
    "Aluminium",
    "Brass",
    "Bronze",
    "Copper",
    "Iron",
    "Nickel",
    "No Metal Type",
    "Palladium",
    "Pewter",
    "Platinum",
    "Rose Gold",
    "Silver",
    "Stainless Steel",
    "Sterling Silver",
    "Titanium",
    "Tungsten",
    "Tungsten Carbide",
    "White Gold",
    "Yellow Gold",
    "Zinc",
  ];
  const materialOptions = ["Lac", "Metal"];

  return (
    <div>
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">
        Amazon Fields
      </h3>
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-300 space-y-4">
        <label className="flex flex-col">
          Amazon Item Name
          <input
            {...register("item_name.0.value", {
              required: "Item name is required",
            })}
            className="p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </label>
        <label className="flex flex-col">
          Part Number
          <input
            {...register("part_number.0.value", {
              required: "Part Number is required",
            })}
            className="p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </label>
        <label className="flex flex-col">
          Product Description
          <textarea
            {...register("product_description.0.value", {
              required: "Product Description is required",
            })}
            rows={5}
            className="p-2 border border-yellow-400 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter a detailed description..."
          ></textarea>
        </label>

        <label className="flex flex-col">
          Metal Type
          <select
            {...register("metal_type.0.value", {
              required: "Metal type is required",
            })}
            className="p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 max-h-40 overflow-y-auto"
          >
            <option value="">Select Metal Type</option>
            {metalTypeOptions.map((metal) => (
              <option key={metal} value={metal}>
                {metal}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col">
          Metals
          <select
            {...register("metals.metal_type.0.value", {
              required: "Material is required",
            })}
            className="p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 max-h-40 overflow-y-auto"
          >
            <option value="">Select Metals</option>
            {metalsOptions.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col">
          Material
          <select
            {...register("material.0.value", {
              required: "Material is required",
            })}
            className="p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 max-h-40 overflow-y-auto"
          >
            <option value="">Select Material</option>
            {materialOptions.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          Item Length
          <input
            {...register("item_length.0.vale", {
              required: "Item Length required",
            })}
            className="p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </label>
        <label className="flex flex-col">
          Item Weight
          <input
            {...register("item_weight.0.vale", {
              required: "Item Weight required",
            })}
            className="p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </label>
        <label className="flex flex-col">
          Item Type Name
          <input
            {...register("item_type_name.0.vale", {
              required: "Item Type Name required",
            })}
            className="p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </label>
        <label className="flex flex-col">
          Clasp Type
          <select
            {...register("clasp_type.0.value", {
              required: "Clasp type is required",
            })}
            className="p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 max-h-40 overflow-y-auto"
          >
            <option value="">Select Clasp Type</option>
            <option value="Slide">Slide</option>
            <option value="Scroll">Scroll</option>
          </select>
        </label>
        <label className="flex flex-col">
          Generic Keyword
          <input
            {...register("generic_keyword")}
            className="p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </label>
        {/* Bullet Points */}
        <div className="mt-6">
          <h4 className="text-md font-semibold text-yellow-700 mb-2">
            Bullet Points
          </h4>
          {bulletPoints.map((bullet, index) => (
            <div key={bullet.id} className="gap-4 items-center mb-2">
              <div className="flex">
                <input
                  {...register(`bullet_point.${index}.value`, {
                    required: "Bullet point is required",
                  })}
                  placeholder={`Bullet Point ${index + 1}`}
                  className="flex-1 p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <input
                  type="hidden"
                  {...register(`bullet_point.${index}.language_tag`)}
                  value="en_IN"
                />
                <input
                  type="hidden"
                  {...register(`bullet_point.${index}.marketplace_id`)}
                  value="A21TJRUUN4KGV"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeBullet(index)}
                  className="text-red-600 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              appendBullet({
                value: "",
                language_tag: "en_IN",
                marketplace_id: "A21TJRUUN4KGV",
              })
            }
            className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 cursor-pointer"
          >
            + Add Bullet Point
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmazonFieldsForm;
