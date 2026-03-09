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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditPost } from '@/hooks/useEditPost';
import { usePostCategories } from '@/hooks/useFetchPostCategories';
import { editPostSchema } from '@/lib/validations/post';
import { ACARA_TYPE, PENGUMUMAN_TYPE, POST_TYPES, type PostType, type PostWithVotes } from '@/types/post';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, Edit2Icon } from 'lucide-react';
import { toast } from 'sonner';
import z from 'zod';

interface EditDialogProps {
  post: PostWithVotes;
}

type EditPostFormData = z.infer<typeof editPostSchema>;

const defaultFormValues: EditPostFormData = {
  title: '',
  content: '',
  type: PENGUMUMAN_TYPE,
  categories: [],
  startDate: '',
  endDate: '',
};

const EditDialog = ({ post }: EditDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: editPost, isPending } = useEditPost();
  const { data: categories } = usePostCategories();

  const methods = useForm<EditPostFormData>({
    resolver: zodResolver(editPostSchema),
    defaultValues: defaultFormValues,
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = methods;
  const selectedType = watch('type');

  const onSubmit = async (data: EditPostFormData) => {
    try {
      const categoryIds = data.categories?.map(code => categories?.find(c => c.code === code)?.id || '') ?? [];

      await editPost({
        id: post.id,
        title: data.title,
        content: data.content,
        type: data.type,
        categoryIds,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      });

      setIsOpen(false);
      toast.success('Post updated successfully', {
        duration: 3000,
        position: 'top-center',
      });
    } catch {
      toast.error('Failed to update post', {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  useEffect(() => {
    if (isOpen && post) {
      reset({
        title: post.title,
        content: post.content,
        type: post.type as PostType,
        categories: post.categories.map(x => x.code),
        startDate: post.startDate || '',
        endDate: post.endDate || '',
      });
    } else if (!isOpen) {
      reset(defaultFormValues);
    }
  }, [isOpen, post, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="!px-1 text-blue-500" disabled={isPending}>
          <Edit2Icon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {POST_TYPES.find(t => t.value === post.type)?.label ?? 'Post'}</DialogTitle>
        </DialogHeader>

        <FormSchemaProvider schema={editPostSchema} methods={methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              {(errors.title || errors.content || errors.type) && (
                <Alert variant="destructive" className="border-red-600 bg-red-300/40">
                  <AlertCircleIcon />
                  <AlertTitle className="tracking-wider capitalize">
                    {errors.title?.message || errors.content?.message || errors.type?.message}
                  </AlertTitle>
                </Alert>
              )}
              <FormController
                name="title"
                renderInput={field => (
                  <div className="grid gap-1">
                    <Label htmlFor="title">Title</Label>
                    <Input {...field} id="title" autoFocus={false} placeholder="Enter title" disabled={isPending} />
                  </div>
                )}
              />
              <FormController
                name="type"
                renderInput={field => (
                  <div className="grid gap-1">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value);
                        if (value === PENGUMUMAN_TYPE) {
                          setValue('startDate', '');
                          setValue('endDate', '');
                        }
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {POST_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              {selectedType === PENGUMUMAN_TYPE && (
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
              )}
              {selectedType === ACARA_TYPE && (
                <div className="grid grid-cols-2 gap-3">
                  <FormController
                    name="startDate"
                    renderInput={field => (
                      <div className="grid gap-1">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input {...field} id="startDate" type="date" disabled={isPending} />
                      </div>
                    )}
                  />
                  <FormController
                    name="endDate"
                    renderInput={field => (
                      <div className="grid gap-1">
                        <Label htmlFor="endDate">End Date (Optional)</Label>
                        <Input {...field} id="endDate" type="date" disabled={isPending} />
                      </div>
                    )}
                  />
                </div>
              )}
              <FormController
                name="content"
                renderInput={field => (
                  <div className="grid gap-1">
                    <Label htmlFor="content">Content</Label>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write your content here."
                      disabled={isPending}
                      className="min-h-[200px]"
                      storageFolder="posts"
                      fileNamePrefix="post"
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
  );
};

export default EditDialog;
