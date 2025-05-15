import React from 'react'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea' // From ShadCN UI

const FormInput = ({ name, label, form }) => {
  // Detect if this field should use a textarea
  const isTextarea = 
    name === 'product_description' ||
    name.startsWith('bullet_point') ||
    label.toLowerCase().includes('description') ||
    label.toLowerCase().includes('bullet')

  return (
    <div>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              {isTextarea ? (
                <Textarea placeholder={`Enter ${label.toLowerCase()}`} {...field} />
              ) : (
                <Input placeholder="shadcn" {...field} />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default FormInput
