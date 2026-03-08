import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import CategorySelector from '@/components/CategorySelector';
import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePost } from '@/hooks/useCreatePost';
import { usePostCategories } from '@/hooks/useFetchPostCategories';
import { createPostSchema } from '@/lib/validations/post';
import { ACARA_TYPE, PENGUMUMAN_TYPE, POST_TYPES } from '@/types/post';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

type CreatePostForm = z.infer<typeof createPostSchema>;

const defaultFormValues: CreatePostForm = {
  title: '',
  type: PENGUMUMAN_TYPE,
  content: '',
  categories: [],
  startDate: '',
  endDate: '',
};

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const { mutate, isPending, isSuccess, isError } = useCreatePost();
  const { data: categories } = usePostCategories();

  const methods = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: defaultFormValues,
  });

  const { reset, handleSubmit, watch, setValue } = methods;
  const selectedType = watch('type');

  const handleCreateSubmission = (data: CreatePostForm) => {
    setErrorMessage(undefined);

    const textContent = data.content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      setErrorMessage('Content cannot be empty');
      return;
    }

    const categoryIds = data.categories?.map(code => categories?.find(c => c.code === code)?.id || '') ?? [];

    mutate({
      title: data.title,
      content: data.content,
      type: data.type,
      categoryIds,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
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
      toast.success('Post created successfully!', {
        duration: 3000,
        position: 'top-center',
      });
    } else if (isError) {
      setErrorMessage('Failed to create post');
    }
  }, [isSuccess, isError, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} size="lg" className="tracking-wide">
          Tambah Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <FormSchemaProvider schema={createPostSchema} methods={methods}>
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
                      <Input {...field} autoFocus={true} placeholder="Enter title" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormController
                name="type"
                renderInput={field => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={value => {
                        field.onChange(value);
                        if (value === PENGUMUMAN_TYPE) {
                          setValue('startDate', '');
                          setValue('endDate', '');
                        }
                      }}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {POST_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
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
                      <FormItem>
                        <FormLabel>Start Date (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormController
                    name="endDate"
                    renderInput={field => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" min={watch('startDate')} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <FormController
                name="content"
                renderInput={field => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Write your content here."
                        disabled={isPending}
                        className="min-h-[200px]"
                        storageFolder="posts"
                        fileNamePrefix="post"
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
