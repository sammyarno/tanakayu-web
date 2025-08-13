import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateNewsEvent } from '@/hooks/useCreateNewsEvent';
import { createNewsEventSchema } from '@/lib/validations/news-event';
import { EVENT_TYPE, NEWS_EVENT_TYPES, NEWS_TYPE } from '@/types/news-event';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

type CreateNewsEventForm = z.infer<typeof createNewsEventSchema>;

const defaultFormValues: CreateNewsEventForm = {
  title: '',
  type: NEWS_TYPE,
  startDate: '',
  endDate: '',
  content: '',
};

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const { mutate, isPending, isSuccess, isError } = useCreateNewsEvent();
  const { username } = useAuth();

  const methods = useForm<CreateNewsEventForm>({
    resolver: zodResolver(createNewsEventSchema),
    defaultValues: defaultFormValues,
  });

  const { reset, handleSubmit, watch, setValue } = methods;
  const selectedType = watch('type');

  const handleCreateSubmission = (data: CreateNewsEventForm) => {
    setErrorMessage(undefined);

    const textContent = data.content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      setErrorMessage('Content cannot be empty');
      return;
    }

    mutate({
      title: data.title,
      content: data.content,
      type: data.type,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
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
      toast.success('News/Event created successfully!', {
        duration: 3000,
        position: 'top-center',
      });
    } else if (isError) {
      setErrorMessage('Failed to create news/event');
    }
  }, [isSuccess, isError, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} size="lg" className="tracking-wide">
          Tambah Berita/Acara
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create News/Event</DialogTitle>
        </DialogHeader>

        <FormSchemaProvider schema={createNewsEventSchema} methods={methods}>
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
                      <Input {...field} autoFocus={true} placeholder="Enter news/event title" disabled={isPending} />
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
                        // Reset date fields when switching to news
                        if (value === NEWS_TYPE) {
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
                        {NEWS_EVENT_TYPES.map(type => (
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
                        placeholder="Write your news/event content here. You can format text, add images, and create lists."
                        disabled={isPending}
                        className="min-h-[200px]"
                        storageFolder="news-events"
                        fileNamePrefix="news-event"
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
