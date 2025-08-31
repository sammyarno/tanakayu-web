'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/auth/useAuth';
import { useUpdateExpenditure } from '@/hooks/useUpdateExpenditure';
import { type UpdateExpenditureFormData, updateExpenditureSchema } from '@/lib/validations/expenditure';
import { type Expenditure } from '@/types/expenditure';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, SaveIcon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

interface UpdateDialogProps {
  expenditure: Expenditure;
  isOpen: boolean;
  onClose: () => void;
}

const UpdateDialog = ({ expenditure, isOpen, onClose }: UpdateDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const { username } = useAuth();
  const { mutate, isPending, isSuccess, isError } = useUpdateExpenditure();

  const methods = useForm<UpdateExpenditureFormData>({
    resolver: zodResolver(updateExpenditureSchema),
    defaultValues: {
      date: expenditure.date,
      description: expenditure.description,
      image: undefined as any,
    },
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

  const handleUpdateSubmission = async (data: UpdateExpenditureFormData) => {
    setErrorMessage(undefined);
    setIsUploading(true);

    try {
      let imageUrl = expenditure.imagePath;

      // Upload new image if provided
      if (data.image) {
        imageUrl = await uploadImage(data.image);
      }

      // Update expenditure record
      mutate({
        id: expenditure.id,
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
    if (isOpen) {
      reset({
        date: expenditure.date,
        description: expenditure.description,
        image: undefined as any,
      });
      setErrorMessage(undefined);
      setIsUploading(false);
    }
  }, [isOpen, expenditure, reset]);

  useEffect(() => {
    if (isSuccess && !isError) {
      onClose();
      setErrorMessage(undefined);
      setIsUploading(false);
      toast.success('Expenditure report updated successfully!', {
        duration: 3000,
        position: 'top-center',
      });
    } else if (isError) {
      setErrorMessage('Failed to update expenditure report');
      setIsUploading(false);
    }
  }, [isSuccess, isError, onClose]);

  const isSubmitting = isPending || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Expenditure Report</DialogTitle>
        </DialogHeader>
        <FormSchemaProvider methods={methods} schema={updateExpenditureSchema}>
          <form onSubmit={handleSubmit(handleUpdateSubmission)} className="space-y-4">
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
                    <Input {...field} type="date" />
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
                  <FormLabel>Report Image (JPG/PNG, max 200KB) - Optional</FormLabel>
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
                  {selectedFile ? (
                    <p className="text-sm text-gray-600">
                      New file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Current image will be kept if no new file is selected</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? 'Uploading...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Update Report
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

export default UpdateDialog;
