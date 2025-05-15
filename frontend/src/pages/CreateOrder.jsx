import { Input } from "@/components/ui/input";
import React, { useState } from "react";
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
import axios from "axios";
import { BASE_URL, createOrder } from "@/services/api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent } from "@radix-ui/react-popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils"

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
    formState: { errors },
  } = form;

  const { fields: orderItemFields, append: appendOrderItem, remove: removeOrderItem } = useFieldArray({
    control,
    name: "orderItems",
  });

  const orderType = watch("orderType");
  const selectedCountryCode = watch("countryCode");

  const onSubmit = async (data) => {
    setIsLoading(true);
    const mobileData = [{
      countryCode: data.countryCode,
      number: data.mobile,
    }];
    console.log("data with correct mobile format:", { ...data, mobile: mobileData });
    try {
      const response = await createOrder({ ...data, mobile: mobileData });
      if (response.success) {
        setOrder(response.data);
        toast.success("order created successfully");
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
            {/* Dropdowns */}
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

            {/* Order Fields */}
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
              <div key={item.id} className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`orderItems.${index}.sku`}
                  rules={{ required: "SKU is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SKU" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
