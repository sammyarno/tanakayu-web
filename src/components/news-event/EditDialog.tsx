import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/auth/useAuth';
import { useEditNewsEvent } from '@/hooks/useEditNewsEvent';
import { editNewsEventSchema } from '@/lib/validations/news-event';
import {
  EVENT_TYPE,
  NEWS_EVENT_TYPES,
  NEWS_TYPE,
  type NewsEventType,
  type NewsEventWithComment,
} from '@/types/news-event';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, Edit2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

interface EditDialogProps {
  item: NewsEventWithComment;
}

type EditNewsEventFormData = z.infer<typeof editNewsEventSchema>;

const defaultFormValues: EditNewsEventFormData = {
  title: '',
  content: '',
  type: NEWS_TYPE,
  startDate: '',
  endDate: '',
};

const EditDialog = (props: EditDialogProps) => {
  const { item } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: editNewsEvent, isPending } = useEditNewsEvent();
  const { username } = useAuth();

  const methods = useForm<EditNewsEventFormData>({
    resolver: zodResolver(editNewsEventSchema),
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

  const onSubmit = async (data: EditNewsEventFormData) => {
    try {
      await editNewsEvent({
        id: item.id,
        title: data.title,
        content: data.content,
        type: data.type,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        actor: username || '',
      });

      setIsOpen(false);
      toast.success('News event updated successfully', {
        duration: 3000,
        position: 'top-center',
      });
    } catch {
      toast.error('Failed to update news event', {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  useEffect(() => {
    if (isOpen && item) {
      reset({
        title: item.title,
        content: item.content,
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        type: item.type as NewsEventType,
      });
    } else if (!isOpen) {
      reset(defaultFormValues);
    }
  }, [item, reset, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="!px-1 text-blue-500" disabled={isPending}>
          <Edit2Icon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {NEWS_EVENT_TYPES.find(type => type.value === item.type)?.label}</DialogTitle>
        </DialogHeader>

        <FormSchemaProvider schema={editNewsEventSchema} methods={methods}>
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
                    <Input
                      {...field}
                      id="title"
                      autoFocus={true}
                      placeholder="Enter news/event title"
                      disabled={isPending}
                    />
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
                        if (value === NEWS_TYPE) {
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
                        {NEWS_EVENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              {selectedType === EVENT_TYPE && (
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
                      placeholder="Write your news/event content here. You can format text, add images, and create lists."
                      disabled={isPending}
                      className="min-h-[200px]"
                      storageFolder="news-events"
                      fileNamePrefix="news-event"
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
