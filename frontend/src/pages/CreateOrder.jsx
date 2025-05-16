import { Input } from "@/components/ui/input";
import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BASE_URL, createOrder, getProducts } from "@/services/api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent } from "@radix-ui/react-popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

// Sample array of country codes and names (replace with a more comprehensive list)
const countryCodes = [
  { name: "India", code: "+91" },
  { name: "United States", code: "+1" },
  { name: "United Kingdom", code: "+44" },
  { name: "Australia", code: "+61" },
  { name: "Canada", code: "+1" },
  // Add more countries here
];

const CreateOrder = () => {
  const [order, setOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchProducts, setSearchProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRefs = useRef([]);
  const form = useForm({
    defaultValues: {
      orderFrom: "",
      orderType: "",
      orderId: "",
      orderDate: "",
      orderItems: [{ sku: "", quantity: "" }],
      advanceDiposite: "",
      amount: "",
      shippingCharges: "",
      name: "",
      mobile: "",
      city: "",
      address: "",
      pinCode: "",
      country: "",
      note: "",
      countryCode: countryCodes[0].code, // Default to the first country code
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const { fields: orderItemFields, append: appendOrderItem, remove: removeOrderItem } = useFieldArray({
    control,
    name: "orderItems",
  });

  const orderType = watch("orderType");
  const selectedCountryCode = watch("countryCode");

  const fetchProducts = async (searchTerm) => {
    setIsSearching(true);
    try {
      const res = await getProducts({ search: searchTerm });
      if (res && res?.products) {
        setSearchProducts(res.products.flatMap(product =>
          product.variants.map(variant => ({
            sku: variant.sku,
            title: product.title,
            size: variant.size?.[0]?.value,
            color: variant.color?.[0]?.value,
            image: variant.main_product_image_locator?.[0]?.media_location,
            product_id: product._id, // Optionally include product ID if needed
          }))
        ));
      } else {
        setSearchProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast.error("Failed to fetch products for search");
      setSearchProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSkuInputChange = (index, event) => {
    const searchTerm = event.target.value;
    setValue(`orderItems.${index}.sku`, searchTerm);
    setIsDropdownOpen(true);
    setFocusedIndex(-1); // Reset focused index on input change
    if (searchTerm.length > 0) {
      fetchProducts(searchTerm);
    } else {
      setSearchProducts([]);
    }
  };

  const handleInputFocus = (index) => {
    const currentSku = getValues(`orderItems.${index}.sku`);
    setIsDropdownOpen(true);
    setFocusedIndex(-1);
    if (!currentSku) {
      fetchProducts(""); // Show all products when input is focused and empty
    } else if (currentSku.length > 0 && searchProducts.length === 0) {
      fetchProducts(currentSku); // Re-fetch if input has value but no results
    }
  };

  const handleSelectProduct = (index, product) => {
    setValue(`orderItems.${index}.sku`, product.sku);
    setIsDropdownOpen(false);
    setSearchProducts([]);
    // Optionally focus on the quantity input after selecting a product
    if (inputRefs.current[index]?.nextElementSibling) {
      inputRefs.current[index].nextElementSibling.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (!isDropdownOpen || searchProducts.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((prevIndex) => Math.min(prevIndex + 1, searchProducts.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (event.key === "Enter" && focusedIndex !== -1) {
      event.preventDefault();
      handleSelectProduct(index, searchProducts[focusedIndex]);
    } else if (event.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize inputRefs array with the correct size
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, orderItemFields.length);
  }, [orderItemFields.length]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const mobileData = [{
      countryCode: data.countryCode,
      number: data.mobile,
    }];

    try {
      const response = await createOrder({ ...data, mobile: mobileData });
      if (response.success) {
        setOrder(response.data);
        toast.success("order created successfully");
        form.reset(); // Reset the form after successful submission
      }
    } catch (error) {
      console.error("order creation failed:", error);
      toast.error("Failed to create order");
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-yellow-50 p-6 rounded-md border border-yellow-300 shadow">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="orderFrom"
              rules={{ required: "Order from is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">Order From</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="whatsapp">Whatsapp</SelectItem>
                      <SelectItem value="mirraw">Mirraw</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="orderType"
              rules={{ required: "Order Type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">Order Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="prepaid">Prepaid</SelectItem>
                      <SelectItem value="cod">COD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {["orderId"].map((fieldName) => (
              <FormField
                key={fieldName}
                control={control}
                name={fieldName}
                rules={{ required: `${fieldName} is required` }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl capitalize">{fieldName.replace(/([A-Z])/g, " $1")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={fieldName} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormField
              control={control}
              name="orderDate"
              rules={{ required: "Order Date is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">Order Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Input
                          value={field.value ? new Date(field.value).toLocaleDateString() : ""}
                          placeholder="dd/mm/yyyy"
                          className={cn("bg-white")}
                        />
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={field.onChange}
                        className={cn("rounded-md border")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {orderType === "cod" && (
              <>
                <FormField
                  control={control}
                  name="advanceDiposite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl">Advance Deposit</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Advance amount" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <FormLabel className="text-xl">Order Items</FormLabel>
            {orderItemFields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-2 gap-4 relative">
                <FormField
                  control={control}
                  name={`orderItems.${index}.sku`}
                  rules={{ required: "SKU is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Search by SKU, Title, ID"
                          onChange={(e) => handleSkuInputChange(index, e)}
                          onFocus={() => handleInputFocus(index)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          ref={(el) => (inputRefs.current[index] = el)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isDropdownOpen && searchProducts.length > 0 && (
                  <div ref={dropdownRef} className="absolute top-12 left-0 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-52 overflow-y-auto z-10">
                    <ul>
                      {searchProducts.map((product, i) => (
                        <li
                          key={product.sku}
                          className={cn(
                            "cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-100",
                            focusedIndex === i && "bg-blue-500 text-white"
                          )}
                          onClick={() => handleSelectProduct(index, product)}
                        >
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-8 h-8 object-cover rounded-sm"
                            />
                          )}
                          <div>
                            {product.sku} - {product.title}
                            {product.size && ` (${product.size})`}
                            {product.color && ` (${product.color})`}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <FormField
                  control={control}
                  name={`orderItems.${index}.quantity`}
                  rules={{ required: "Quantity is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="Quantity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2 text-right">
                  <Button variant="destructive" type="button" onClick={() => removeOrderItem(index)}>
                    Remove Item
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={() => appendOrderItem({ sku: "", quantity: "" })}>
              + Add Item
            </Button>
          </div>

          {/* Customer Details */}
          <div className="space-y-4 border-t border-yellow-300 pt-4">
            <FormLabel className="text-xl">Customer Details</FormLabel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl">Country Code</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Code" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} ({country.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="mobile"
                rules={{ required: "Mobile number is required" }}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xl">Mobile Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your mobile number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {["name", "city", "address", "country", "pinCode"].map((fieldName) => (
              <FormField
                key={fieldName}
                control={control}
                name={fieldName}
                rules={{ required: `${fieldName} is required` }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl capitalize">{fieldName}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={`Enter ${fieldName}`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <FormField
              control={control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Any additional note" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600"
              disabled={isLoading} // Disable the button while loading
            >
              {isLoading ? (
                <Progress className="w-6 h-6 rounded-full border-2 border-transparent border-t-white animate-spin" />
              ) : (
                "Submit Order"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateOrder;