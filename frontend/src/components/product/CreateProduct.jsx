import { useForm, useFieldArray } from "react-hook-form";
import { createProduct as createProductApi, BASE_URL } from "@/services/api";
import CommonFieldsForm from "./CommonFieldsForm";
import AmazonFieldsForm from "./AmazonFieldsForm";
import ShopifyFieldsForm from "./ShopifyFieldsForm";
import ImageFieldsForm from "./ImageFieldsForm";
import ImageUploader from "../ImageUploader";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useState } from "react";
import { Spinner } from "../Spinner";

const CreateProduct = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      product_type: "",
      productTitle: "",
      productPrice: "",
      quantity: "",
      productImage: "",
      sku: "",
      relatedSku: [{ sku: "", quantity: "" }],
      status: "active",
      tags: [""],
      title: "",
      body_html: "",
      item_name: [
        { value: "", language_tag: "en_IN", marketplace_id: "A21TJRUUN4KGV" },
      ],
      product_description: [
        { value: "", language_tag: "en_IN", marketplace_id: "A21TJRUUN4KGV" },
      ],
      part_number: [{ value: "", marketplace_id: "A21TJRUUN4KGV" }],
      metals: [
        {
          id: 1,
          metal_type: { value: "", language_tag: "en_IN" },
          metal_stamp: { value: "None", language_tag: "en_IN" },
          marketplace_id: "A21TJRUUN4KGV",
        },
      ],
      item_length: [
        {
          unit: "centimeters",
          value: "",
          marketplace_id: "A21TJRUUN4KGV",
        },
      ],
      item_weight: [
        {
          unit: "grams",
          value: "",
          marketplace_id: "A21TJRUUN4KGV",
        },
      ],
      item_type_name: [
        {
          language_tag: "en_IN",
          value: "",
          marketplace_id: "A21TJRUUN4KGV",
        },
      ],
      metal_type: [
        { value: "", language_tag: "en_IN", marketplace_id: "A21TJRUUN4KGV" },
      ],
      material: [
        { value: "", language_tag: "en_IN", marketplace_id: "A21TJRUUN4KGV" },
      ],
      clasp_type: [
        {
          language_tag: "en_IN",
          value: "",
          marketplace_id: "A21TJRUUN4KGV",
        },
      ],
      bullet_point: [
        {
          language_tag: "en_IN",
          value: "",
          marketplace_id: "A21TJRUUN4KGV",
        },
      ],
        generic_keyword: [
      {
        language_tag: "en_IN",
        value:"",
        marketplace_id: "A21TJRUUN4KGV"
      }
    ],
      main_product_image_locator: null, // Changed to null to hold File object
      other_product_image_locator_1: null,
      other_product_image_locator_2: null,
      other_product_image_locator_3: null,
      other_product_image_locator_4: null,
      other_product_image_locator_5: null,
      variants: [],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });
  const {
    fields: bulletPoints,
    append: appendBullet,
    remove: removeBullet,
  } = useFieldArray({
    control,
    name: "bullet_point",
  });

  const {
    fields: variantRelatedSkuFields,
    append: variantAppendRelatedSku,
    remove: variantRemoveRelatedSku,
  } = useFieldArray({
    control,
    name: "relatedSku",
  });
  const addVariant = () => {
    appendVariant({
      sku: "",
      relatedSku: [{ sku: "", quantity: "" }],
      quantity: "",
      price: "",
      compare_at_price: "",
      inventory_quantity: "",
      part_number: [{ value: "", marketplace_id: "A21TJRUUN4KGV" }],
      size: [
        { value: "", language_tag: "en_IN", marketplace_id: "A21TJRUUN4KGV" },
      ],
      color: [
        { value: "", language_tag: "en_IN", marketplace_id: "A21TJRUUN4KGV" },
      ],
      style: [
        { value: "", language_tag: "en_IN", marketplace_id: "A21TJRUUN4KGV" },
      ],
      purchasable_offer: [
        {
          currency: "INR",
          audience: "ALL",
          maximum_retail_price: [{ schedule: [{ value_with_tax: 0 }] }],
          our_price: [{ schedule: [{ value_with_tax: 0 }] }],
          marketplace_id: "A21TJRUUN4KGV",
        },
      ],
      child_parent_sku_relationship: [
        {
          child_relationship_type: "variation",
          parent_sku: "",
          marketplace_id: "A21TJRUUN4KGV",
        },
      ],
      fulfillment_availability: [
        { fulfillment_channel_code: "DEFAULT", quantity: 1 },
      ],
      main_product_image_locator: null, // Changed to null
      other_product_image_locator_1: null,
      other_product_image_locator_2: null,
      other_product_image_locator_3: null,
      other_product_image_locator_4: null,
      other_product_image_locator_5: null,
    });
  };

  const onSubmit = async (data) => {
    console.log(data);
    setIsLoading(true);
    try {
      const updatedData = { ...data };

      // Handle image upload for productImage field
      if (data.productImage && data.productImage.length > 0) {
        const imageFile = data.productImage[0]; // Get the first file from FileList
        const imageFormData = new FormData();
        imageFormData.append("productImage", imageFile);

        try {
          const uploadResponse = await axios.post(
            `${BASE_URL}/api/v1/image/single-upload`,
            imageFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          updatedData.productImage = uploadResponse?.data?.imageUrl || "";
        } catch (error) {
          console.error("Image upload failed:", error);
          return;
        }
      }

      const parentFormData = new FormData();
      const parentImageFields = [
        "main_product_image_locator",
        "other_product_image_locator_1",
        "other_product_image_locator_2",
        "other_product_image_locator_3",
        "other_product_image_locator_4",
        "other_product_image_locator_5",
      ];

      for (const field of parentImageFields) {
        if (data[field] instanceof File) {
          parentFormData.append("file", data[field]);
        }
      }

      let parentImageUrls = [];
      if (parentFormData.has("file")) {
        const uploadResponse = await fetch(`${BASE_URL}/api/v1/image/upload`, {
          method: "POST",
          body: parentFormData,
        });
        
console.log(uploadResponse)
        if (!uploadResponse.ok) {
          const errorResult = await uploadResponse.text();
          console.error("Parent image upload failed:", errorResult);
          return;
        }

        const uploadResult = await uploadResponse.json();
        parentImageUrls = uploadResult.imageUrls?.file || [];
      }
      updatedData.main_product_image_locator = parentImageUrls[0]
        ? [parentImageUrls[0]]
        : [];
      updatedData.other_product_image_locator_1 = parentImageUrls[1]
        ? [parentImageUrls[1]]
        : [];
      updatedData.other_product_image_locator_2 = parentImageUrls[2]
        ? [parentImageUrls[2]]
        : [];
      updatedData.other_product_image_locator_3 = parentImageUrls[3]
        ? [parentImageUrls[3]]
        : [];
      updatedData.other_product_image_locator_4 = parentImageUrls[4]
        ? [parentImageUrls[4]]
        : [];
      updatedData.other_product_image_locator_5 = parentImageUrls[5]
        ? [parentImageUrls[5]]
        : [];

      // Handle variant images upload correctly
      const updatedVariants = await Promise.all(
        data.variants.map(async (variant, index) => {
          const variantFormData = new FormData();
          const variantImageFields = [
            "main_product_image_locator",
            "other_product_image_locator_1",
            "other_product_image_locator_2",
            "other_product_image_locator_3",
            "other_product_image_locator_4",
            "other_product_image_locator_5",
          ];

          for (const field of variantImageFields) {
            if (variant[field] instanceof File) {
              variantFormData.append("file", variant[field]);
            }
          }

          let variantImageUrls = [];
          if (variantFormData.has("file")) {
            const variantUploadResponse = await fetch(
              `${BASE_URL}/api/v1/image/upload`,
              {
                method: "POST",
                body: variantFormData,
              }
            );

            if (!variantUploadResponse.ok) {
              const errorResult = await variantUploadResponse.text();
              return { ...variant, uploadError: errorResult };
            }

            const variantUploadResult = await variantUploadResponse.json();
            variantImageUrls = variantUploadResult.imageUrls?.file || [];
          }

          return {
            ...variant,
            main_product_image_locator: variantImageUrls[0]
              ? [variantImageUrls[0]]
              : [],
            other_product_image_locator_1: variantImageUrls[1]
              ? [variantImageUrls[1]]
              : [],
            other_product_image_locator_2: variantImageUrls[2]
              ? [variantImageUrls[2]]
              : [],
            other_product_image_locator_3: variantImageUrls[3]
              ? [variantImageUrls[3]]
              : [],
            other_product_image_locator_4: variantImageUrls[4]
              ? [variantImageUrls[4]]
              : [],
            other_product_image_locator_5: variantImageUrls[5]
              ? [variantImageUrls[5]]
              : [],
          };
        })
      );

      updatedData.variants = updatedVariants;

      const response = await createProductApi(updatedData);
      console.log(response);
      if (response?.success) {
        toast.success("Product Created successfully");
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Something Wrong", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-7xl mx-auto space-y-5 bg-gray-50 rounded-xl shadow-lg"
    >
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Create Product
      </h1>
      <div className="p-4 md:p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-700 border-b pb-2">
          Basic Info
        </h2>

        {/* Common Fields */}
        <CommonFieldsForm
          register={register}
          name="relatedSku"
          control={control}
          setValue={setValue}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Amazon Fields */}
          <AmazonFieldsForm
            register={register}
            bulletPoints={bulletPoints}
            appendBullet={appendBullet}
            removeBullet={removeBullet}
          />

          {/* Shopify Fields */}
          <ShopifyFieldsForm register={register} />
        </div>
      </div>
      {/* IMAGES */}
      <ImageFieldsForm register={register} watch={watch} setValue={setValue} />
      {/* VARIANTS */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-300 pb-2">
          Variants
        </h2>
        {variantFields.map((variant, index) => (
          <div
            key={variant.id}
            className="p-6 bg-white rounded-xl mb-8 shadow-md space-y-6"
          >
            <div>
              <div className=" mb-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-md space-y-4">
                  <h3 className="text-lg font-semibold text-blue-700">
                    Variant {index + 1}
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </h3>
                  {[
                    { label: "Variant SKU", name: `variants.${index}.sku` },
                    { label: "Quantity", name: `variants.${index}.quantity` },
                    { label: "Size", name: `variants.${index}.size.0.value` },
                    { label: "Color", name: `variants.${index}.color.0.value` },
                  ].map(({ label, name }) => (
                    <label
                      className="flex flex-col text-sm text-gray-700"
                      key={name}
                    >
                      {label}
                      <input
                        {...register(name)}
                        className="mt-1 p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </label>
                  ))}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-yellow-700 mb-2">
                      Related Sku
                    </h4>
                    {variantRelatedSkuFields.map(
                      (relatedSku, relatedSkuIndex) => (
                        <div
                          key={relatedSku.id}
                          className="flex gap-4 items-center mb-2"
                        >
                          <input
                            {...register(
                              `variants.${index}.relatedSku.${relatedSkuIndex}.sku`
                            )}
                            placeholder={`Related Sku ${relatedSkuIndex + 1}`}
                            className="flex-1 p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                          <input
                            {...register(
                              `variants.${index}.relatedSku.${relatedSkuIndex}.quantity`
                            )}
                            placeholder={`Quantity`}
                            className="flex-1 p-2 border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              variantRemoveRelatedSku(relatedSkuIndex)
                            }
                            className="text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        variantAppendRelatedSku({ sku: "", quantity: "" })
                      }
                      className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                      + Add Sku
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Amazon Fields */}
                  <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-md space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-700">
                      Amazon Fields
                    </h3>

                    {[
                      {
                        label: "Part Number",
                        name: `variants.${index}.part_number.0.value`,
                      },
                      {
                        label: "Style",
                        name: `variants.${index}.style.0.value`,
                      },
                      {
                        label: "Fulfillment availability",
                        name: `variants.${index}.fulfillment_availability.0.quantity`,
                      },
                    ].map(({ label, name }) => (
                      <label
                        className="flex flex-col text-sm text-gray-700"
                        key={name}
                      >
                        {label}
                        <input
                          {...register(name)}
                          className="mt-1 p-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </label>
                    ))}

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-yellow-800">
                        Relationship
                      </h4>
                      <label className="flex flex-col text-sm">
                        Relationship Type
                        <select
                          {...register(
                            `variants.${index}.child_parent_sku_relationship.0.child_relationship_type`
                          )}
                          className="mt-1 p-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          <option value="child">Child</option>
                        </select>
                      </label>
                      <label className="flex flex-col text-sm text-gray-700">
                        Parent Sku
                        <input
                          {...register(
                            `variants.${index}.child_parent_sku_relationship.0.parent_sku`
                          )}
                          className="mt-1 p-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-yellow-800">
                        Amazon Price
                      </h4>
                      {[
                        {
                          label: "MRP (Maximum Retail Price)",
                          name: `variants.${index}.purchasable_offer.0.maximum_retail_price.0.schedule.0.value_with_tax`,
                        },
                        {
                          label: "Our Price",
                          name: `variants.${index}.purchasable_offer.0.our_price.0.schedule.0.value_with_tax`,
                        },
                      ].map(({ label, name }) => (
                        <label className="flex flex-col text-sm" key={name}>
                          {label}
                          <input
                            type="number"
                            step="0.01"
                            {...register(name)}
                            className="mt-1 p-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Shopify Fields */}
                  <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-md space-y-4">
                    <h3 className="text-lg font-semibold text-green-700">
                      Shopify Fields
                    </h3>
                    {[
                      { label: "Price", name: `variants.${index}.price` },
                      {
                        label: "Compare at Price",
                        name: `variants.${index}.compare_at_price`,
                      },
                      {
                        label: "Inventory Quantity",
                        name: `variants.${index}.inventory_quantity`,
                      },
                    ].map(({ label, name }) => (
                      <label className="flex flex-col text-sm" key={name}>
                        {label}
                        <input
                          {...register(name)}
                          className="mt-1 p-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Fields for Variant */}
              <div className="px-4">
                <h4 className="text-md font-semibold text-gray-700">
                  Variant Images
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                          name={`variants.${index}.${field}`}
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
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addVariant}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer"
        >
          + Add Variant
        </button>
      </div>
      {/* SUBMIT */} {" "}
      <div className="pt-6 w-full">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner />
              Creating...
            </div>
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateProduct;
