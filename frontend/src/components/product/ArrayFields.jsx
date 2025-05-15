import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import FormInput from "./FormInput";
import { Button } from "../ui/button";

const ArrayFields = ({ name, label, defaultValue,className }) => {
  const form = useFormContext(); // Inherits parent form
  const { control } = form;

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="col-span-full">
      <label className="block font-medium text-sm mb-1">{label}</label>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className={`flex gap-2 ${className ? className : ""}` }>
           <div className="flex-1">
           <FormInput
              name={`${name}.${index}.value`}
              rules={{ required: `${name} is required` }}
              label={`${label} ${index + 1}`}
              form={form}
            />
           </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
              className="h-10 mt-8"
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => append(defaultValue)}
        >
          Add {label}
        </Button>
      </div>
    </div>
  );
};

export default ArrayFields;
