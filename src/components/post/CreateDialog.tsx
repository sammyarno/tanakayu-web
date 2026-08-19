import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

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
import { createPostSchema } from '@/lib/validations/post';
import { usePostCategoriesStore } from '@/store/postCategoriesStore';
import { ANNOUNCEMENT_TYPE, EVENT_TYPE, POST_TYPES } from '@/types/post';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

type CreatePostForm = z.infer<typeof createPostSchema>;

const defaultFormValues: CreatePostForm = {
  title: '',
  type: ANNOUNCEMENT_TYPE,
  content: '',
  categories: [],
  startDate: '',
  endDate: '',
};

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const { mutate, isPending } = useCreatePost();
  const categories = usePostCategoriesStore(state => state.categories);

  const methods = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: defaultFormValues,
  });

  const { reset, handleSubmit, setValue } = methods;
  const selectedType = useWatch({ control: methods.control, name: 'type' });
  const startDate = useWatch({ control: methods.control, name: 'startDate' });

  // Closing the dialog clears the form. Doing it here rather than in an effect
  // on `isOpen` avoids a second render pass every time the dialog toggles.
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset(defaultFormValues);
      setErrorMessage(undefined);
    }
  };

  const handleCreateSubmission = (data: CreatePostForm) => {
    setErrorMessage(undefined);

    const textContent = data.content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      setErrorMessage('Content cannot be empty');
      return;
    }

    const categoryIds = data.categories?.map(code => categories?.find(c => c.code === code)?.id || '') ?? [];

    mutate(
      {
        title: data.title,
        content: data.content,
        type: data.type,
        categoryIds,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      },
      {
        onSuccess: () => {
          handleOpenChange(false);
          toast.success('Post created successfully!', {
            duration: 3000,
            position: 'top-center',
          });
        },
        onError: () => setErrorMessage('Failed to create post'),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} size="lg" className="tracking-wide" variant="secondary">
          Add Post
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
                        if (value === ANNOUNCEMENT_TYPE) {
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
              {selectedType === ANNOUNCEMENT_TYPE && (
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
              {selectedType === EVENT_TYPE && (
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
                          <Input {...field} type="date" min={startDate} disabled={isPending} />
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" disabled={isPending} onClick={() => handleOpenChange(false)} type="button">
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
