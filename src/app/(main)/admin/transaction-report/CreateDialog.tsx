'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateTransaction } from '@/hooks/useCreateTransaction';
import { createTransactionSchema } from '@/lib/validations/transaction';
import { CATEGORY_OPTIONS, CategoryKey } from '@/types/transaction';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import z from 'zod';

type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

const defaultFormValues: CreateTransactionFormData = {
  title: '',
  date: '',
  description: '',
  amount: '',
  category: '' as any,
  type: '' as any,
};

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const { username } = useAuth();
  const { mutate, isPending, isSuccess, isError } = useCreateTransaction();

  const methods = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: defaultFormValues,
  });

  const { handleSubmit, setValue, reset, clearErrors } = methods;

  // Smart category selection: auto-select type based on category
  const handleCategoryChange = (category: string) => {
    const categoryKey = category as CategoryKey;
    const autoType = CATEGORY_OPTIONS[categoryKey];

    // If category has a predefined type, auto-select it
    if (autoType) {
      setValue('type', autoType);
      clearErrors('type');
    }
  };

  const handleCreateSubmission = (data: CreateTransactionFormData) => {
    setErrorMessage(undefined);

    mutate({
      title: data.title,
      date: data.date,
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      type: data.type,
      actor: username || '',
    });
  };

  useEffect(() => {
    if (!isOpen) {
      reset(defaultFormValues);
      setErrorMessage(undefined);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (isSuccess && !isError) {
      setIsOpen(false);
      setErrorMessage(undefined);
      reset(defaultFormValues);
      toast.success('Transaction created successfully!', {
        duration: 3000,
        position: 'top-center',
      });
    } else if (isError) {
      setErrorMessage('Failed to create transaction');
    }
  }, [isSuccess, isError, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-tanakayu-dark" size="lg">
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Transaction</DialogTitle>
        </DialogHeader>
        <FormSchemaProvider methods={methods} schema={createTransactionSchema}>
          <form onSubmit={handleSubmit(handleCreateSubmission)} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive" className="border-red-600 bg-red-300/40">
                <AlertCircleIcon />
                <AlertTitle className="tracking-wider capitalize">{errorMessage}</AlertTitle>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormController
                name="title"
                renderInput={field => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter transaction title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormController
                name="date"
                renderInput={field => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormController
              name="description"
              renderInput={field => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter transaction description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormController
              name="amount"
              renderInput={field => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" placeholder="Enter amount" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormController
                name="category"
                renderInput={field => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value: string) => {
                        field.onChange(value);
                        handleCategoryChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="capitalize">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="capitalize">
                        {Object.keys(CATEGORY_OPTIONS).map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormController
                name="type"
                renderInput={field => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" disabled={isPending} variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </FormSchemaProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDialog;
