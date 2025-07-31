import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEditNewsEvent } from '@/hooks/useEditNewsEvent';
import { useStoredUserDisplayName } from '@/store/userAuthStore';
import { NewsEventWithComment } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, Edit2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const editNewsEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['news', 'event'], { message: 'Type is required' }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type EditNewsEventFormData = z.infer<typeof editNewsEventSchema>;

const EditDialog = ({ item }: { item: NewsEventWithComment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: editNewsEvent, isPending } = useEditNewsEvent();
  const displayName = useStoredUserDisplayName();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditNewsEventFormData>({
    resolver: zodResolver(editNewsEventSchema),
    defaultValues: {
      title: item.title,
      content: item.content,
      type: item.type as 'news' | 'event',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
    },
  });

  const onSubmit = async (data: EditNewsEventFormData) => {
    try {
      await editNewsEvent({
        id: item.id,
        title: data.title,
        content: data.content,
        type: data.type,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        actor: displayName || '',
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
    if (!isOpen) {
      reset({
        title: item.title,
        content: item.content,
        type: item.type as 'news' | 'event',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
      });
    }
  }, [isOpen, item, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="!px-1 text-blue-500" disabled={isPending}>
          <Edit2Icon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {item.type === 'news' ? 'Berita' : 'Acara'}</DialogTitle>
        </DialogHeader>

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
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="title"
                    autoFocus={true}
                    placeholder="Enter news/event title"
                    disabled={isPending}
                  />
                )}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="type">Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">Berita</SelectItem>
                      <SelectItem value="event">Acara</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-3">
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => <Input {...field} id="startDate" type="date" disabled={isPending} />}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => <Input {...field} id="endDate" type="date" disabled={isPending} />}
                />
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="content">Content</Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="content"
                    placeholder="Enter news/event content"
                    disabled={isPending}
                    rows={6}
                  />
                )}
              />
            </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
