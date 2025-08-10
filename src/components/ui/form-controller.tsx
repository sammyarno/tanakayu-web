import {
  Controller,
  type ControllerRenderProps,
  type FieldValues,
  Path,
  useFormContext,
} from 'react-hook-form';

import { ZodTypeAny } from 'zod';

import { useFormSchema } from '../FormSchemaProvider';

type FormControllerProps<T extends FieldValues> = {
  name: Path<T>;
  renderInput: (field: ControllerRenderProps<T>) => React.ReactNode;
};

export function FormController<T extends FieldValues>({ name, renderInput }: FormControllerProps<T>) {
  const { control, clearErrors } = useFormContext<T>();
  const schema = useFormSchema();

  const fieldSchema: ZodTypeAny | undefined = schema.shape?.[name as keyof typeof schema.shape];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const handleChange = (value: any) => {
          if (fieldSchema) {
            const result = fieldSchema.safeParse(value);
            if (result.success) {
              clearErrors(name);
            }
          }
          field.onChange(value);
        };

        return (
          <div>
            {renderInput({ ...field, onChange: handleChange })}
            {fieldState.error && <span className="text-xs text-red-500">{fieldState.error.message}</span>}
          </div>
        );
      }}
    />
  );
}
