import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import CategorySelector from '@/components/CategorySelector';
import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormController } from '@/components/ui/form-controller';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateAnnouncement } from '@/hooks/useCreateAnnouncement';
import { useAnnouncementCategories } from '@/hooks/useFetchAnnouncementCategories';
import { createAnnouncementSchema } from '@/lib/validations/announcement';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

type CreateAnnouncementForm = z.infer<typeof createAnnouncementSchema>;

const defaultFormValues: CreateAnnouncementForm = {
  title: '',
  content: '',
  categories: [],
};

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const { mutate, isPending, isSuccess, isError } = useCreateAnnouncement();
  const { data: categories } = useAnnouncementCategories();
  const { username } = useAuth();

  const methods = useForm<CreateAnnouncementForm>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: defaultFormValues,
  });

  const { reset, handleSubmit } = methods;

  const handleCreateSubmission = (data: CreateAnnouncementForm) => {
    setErrorMessage(undefined);

    const textContent = data.content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      setErrorMessage('Content cannot be empty');
      return;
    }

    const categoryIds = data.categories.map(code => categories?.find(c => c.code === code)?.id || '');

    mutate({
      title: data.title,
      content: data.content,
      categoryIds: categoryIds,
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
      toast.success('Announcement created successfully!', {
        duration: 3000,
        position: 'top-center',
      });
    } else if (isError) {
      setErrorMessage('Failed to create announcement');
    }
  }, [isSuccess, isError, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} size="lg" className="tracking-wide">
          Tambah Pengumuman
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
        </DialogHeader>

        <FormSchemaProvider schema={createAnnouncementSchema} methods={methods}>
          <form onSubmit={handleSubmit(handleCreateSubmission)}>
            <div className="grid gap-4">
              {errorMessage && (
                <Alert variant="destructive" className="border-red-600 bg-red-300/40">
                  <AlertCircleIcon />
                  <AlertTitle className="tracking-wider capitalize">{errorMessage}</AlertTitle>
                </Alert>
              )}
              <FormController
                name="title"
                renderInput={field => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} autoFocus={true} placeholder="Enter announcement title" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormController
                name="categories"
                renderInput={field => (
                  <CategorySelector
                    name="categories"
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              <FormController
                name="content"
                renderInput={field => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Write your announcement content here. You can format text, add images, and create lists."
                        disabled={isPending}
                        className="min-h-[300px]"
                        storageFolder="announcements"
                        fileNamePrefix="announcement"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" disabled={isPending} onClick={() => setIsOpen(false)} type="button">
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
