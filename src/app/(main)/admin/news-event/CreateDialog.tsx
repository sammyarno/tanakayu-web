import { type FormEvent, useEffect, useState } from 'react';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateNewsEvent } from '@/hooks/useCreateNewsEvent';
import { AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [selectedType, setSelectedType] = useState<string>('');
  const [content, setContent] = useState('');
  const { mutateAsync, isPending } = useCreateNewsEvent();
  const { displayName } = useAuth();

  const handleCreateSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(undefined);
    const formData = new FormData(e.currentTarget);

    const title = formData.get('title')?.toString();
    const startDate = formData.get('startDate')?.toString() || null;
    const endDate = formData.get('endDate')?.toString() || null;

    // Strip HTML tags for basic content validation
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!title || !textContent || !selectedType) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    try {
      await mutateAsync({
        title,
        content,
        type: selectedType as 'news' | 'event',
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        actor: displayName || '',
      });

      setIsOpen(false);
      setErrorMessage(undefined);
      setSelectedType('');
      setContent('');
      toast('News/Event created successfully!', {
        duration: 3000,
        position: 'top-center',
      });
    } catch (error) {
      setErrorMessage('Failed to create news/event');
      console.error(error);
    }
  };

  const handleFormError = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('Invalid form submission');
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedType('');
      setErrorMessage(undefined);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} size="lg" className="tracking-wide">
          Tambah Berita/Acara
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create News/Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreateSubmission} onError={handleFormError}>
          <div className="grid gap-4">
            {errorMessage && (
              <Alert variant="destructive" className="border-red-600 bg-red-300/40">
                <AlertCircleIcon />
                <AlertTitle className="tracking-wider capitalize">{errorMessage}</AlertTitle>
              </Alert>
            )}
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                autoFocus={true}
                placeholder="Enter news/event title"
                disabled={isPending}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="type">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">Berita</SelectItem>
                  <SelectItem value="event">Acara</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-3">
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your news/event content here. You can format text, add images, and create lists."
                disabled={isPending}
                className="min-h-[200px]"
                storageFolder="news-events"
                fileNamePrefix="news-event"
              />
            </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateDialog;
