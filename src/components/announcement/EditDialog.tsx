import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import CategorySelector from '@/components/CategorySelector';
import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { useAuth } from '@/hooks/auth/useAuth';
import { useEditAnnouncement } from '@/hooks/useEditAnnouncement';
import { useAnnouncementCategories } from '@/hooks/useFetchAnnouncementCategories';
import { editAnnouncementSchema } from '@/lib/validations/announcement';
import type { Announcement } from '@/types/announcement';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, Edit2Icon } from 'lucide-react';
import { toast } from 'sonner';
import z from 'zod';

interface EditDialogProps {
  announcement: Announcement;
}

type EditAnnouncementFormData = z.infer<typeof editAnnouncementSchema>;

const defaultFormValues: EditAnnouncementFormData = {
  title: '',
  content: '',
  categories: [],
};

const EditDialog = ({ announcement }: EditDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: editAnnouncement, isPending } = useEditAnnouncement();
  const { data: categories } = useAnnouncementCategories();
  const { username } = useAuth();

  const methods = useForm<EditAnnouncementFormData>({
    resolver: zodResolver(editAnnouncementSchema),
    defaultValues: defaultFormValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: EditAnnouncementFormData) => {
    try {
      const categoryIds = data.categories.map(code => categories?.find(c => c.code === code)?.id || '');

      await editAnnouncement({
        id: announcement.id,
        title: data.title,
        content: data.content,
        categories: categoryIds,
        actor: username || '',
      });

      setIsOpen(false);
      toast.success('Announcement updated successfully', {
        duration: 3000,
        position: 'top-center',
      });
    } catch {
      toast.error('Failed to update announcement', {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  useEffect(() => {
    if (isOpen && announcement) {
      reset({
        title: announcement.title,
        content: announcement.content,
        categories: announcement.categories.map(x => x.code),
      });
    } else if (!isOpen) {
      reset(defaultFormValues);
    }
  }, [isOpen, announcement, reset]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="!px-1 text-blue-500" onClick={() => setIsOpen(true)}>
            <Edit2Icon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>

          <FormSchemaProvider schema={editAnnouncementSchema} methods={methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                {(errors.title || errors.content || errors.categories) && (
                  <Alert variant="destructive" className="border-red-600 bg-red-300/40">
                    <AlertCircleIcon />
                    <AlertTitle className="tracking-wider capitalize">
                      {errors.title?.message || errors.content?.message || errors.categories?.message}
                    </AlertTitle>
                  </Alert>
                )}
                <FormController
                  name="title"
                  renderInput={field => (
                    <div className="grid gap-3">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        {...field}
                        id="title"
                        autoFocus={false}
                        placeholder="Enter announcement title"
                        disabled={isPending}
                      />
                    </div>
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
                    <div className="grid gap-3">
                      <Label htmlFor="content">Content</Label>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Write your announcement content here. You can format text, add images, and create lists."
                        disabled={isPending}
                        className="min-h-[200px] w-[386px]"
                        storageFolder="announcements"
                        fileNamePrefix="announcement"
                      />
                    </div>
                  )}
                />
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" disabled={isPending} onClick={() => setIsOpen(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  <Edit2Icon /> Update
                </Button>
              </DialogFooter>
            </form>
          </FormSchemaProvider>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditDialog;
