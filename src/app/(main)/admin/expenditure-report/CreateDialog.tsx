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
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateExpenditure } from '@/hooks/useCreateExpenditure';
import { type CreateExpenditureFormData, createExpenditureSchema } from '@/lib/validations/expenditure';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, PlusIcon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

const defaultFormValues: CreateExpenditureFormData = {
  date: '',
  description: '',
  image: undefined as any,
};

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const { username } = useAuth();
  const { mutate, isPending, isSuccess, isError } = useCreateExpenditure();

  const methods = useForm<CreateExpenditureFormData>({
    resolver: zodResolver(createExpenditureSchema),
    defaultValues: defaultFormValues,
  });

  const { handleSubmit, reset, watch } = methods;
  const selectedFile = watch('image');

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'expenditures');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok || result.error) {
      throw new Error(result.error || 'Upload failed');
    }

    return result.data.url;
  };

  const handleCreateSubmission = async (data: CreateExpenditureFormData) => {
    setErrorMessage(undefined);
    setIsUploading(true);

    try {
      // Upload image first
      const imageUrl = await uploadImage(data.image);

      // Create expenditure record
      mutate({
        date: data.date,
        description: data.description,
        image_path: imageUrl,
        actor: username || '',
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload image');
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      reset(defaultFormValues);
      setErrorMessage(undefined);
      setIsUploading(false);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (isSuccess && !isError) {
      setIsOpen(false);
      setErrorMessage(undefined);
      setIsUploading(false);
      reset(defaultFormValues);
      toast.success('Expenditure report uploaded successfully!', {
        duration: 3000,
        position: 'top-center',
      });
    } else if (isError) {
      setErrorMessage('Failed to create expenditure report');
      setIsUploading(false);
    }
  }, [isSuccess, isError, reset]);

  const isSubmitting = isPending || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-tanakayu-dark" size="lg">
          <PlusIcon className="mr-2 h-4 w-4" />
          Upload Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Expenditure Report</DialogTitle>
        </DialogHeader>
        <FormSchemaProvider methods={methods} schema={createExpenditureSchema}>
          <form onSubmit={handleSubmit(handleCreateSubmission)} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive" className="border-red-600 bg-red-300/40">
                <AlertCircleIcon />
                <AlertTitle className="tracking-wider capitalize">{errorMessage}</AlertTitle>
              </Alert>
            )}

            <FormController
              name="date"
              renderInput={field => (
                <FormItem>
                  <FormLabel>Report Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="month" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormController
              name="description"
              renderInput={field => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter report description" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormController
              name="image"
              renderInput={field => (
                <FormItem>
                  <FormLabel>Report Image (JPG/PNG, max 200KB)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                      }}
                    />
                  </FormControl>
                  {selectedFile && (
                    <p className="text-sm text-gray-600">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? 'Uploading...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormSchemaProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDialog;
