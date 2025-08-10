import React, { createContext, useContext } from 'react';
import { type FieldValues, FormProvider, type UseFormReturn } from 'react-hook-form';

import { z } from 'zod';

type FormSchemaContextValue = {
  schema: z.ZodObject<any>;
};

const FormSchemaContext = createContext<FormSchemaContextValue | null>(null);

export function useFormSchema() {
  const ctx = useContext(FormSchemaContext);
  if (!ctx) throw new Error('useFormSchema must be used inside FormSchemaProvider');
  return ctx.schema;
}

type FormSchemaProviderProps<T extends FieldValues> = {
  methods: UseFormReturn<T>;
  schema: z.ZodObject<any>;
  children: React.ReactNode;
};

export function FormSchemaProvider<T extends FieldValues>({ methods, schema, children }: FormSchemaProviderProps<T>) {
  return (
    <FormSchemaContext.Provider value={{ schema }}>
      <FormProvider<T> {...methods}>{children}</FormProvider>
    </FormSchemaContext.Provider>
  );
}
