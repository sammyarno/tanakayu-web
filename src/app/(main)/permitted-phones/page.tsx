'use client';

import { useState } from 'react';

import Breadcrumb from '@/components/Breadcrumb';
import LoadingIndicator from '@/components/LoadingIndicator';
import PageContent from '@/components/PageContent';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SUPERADMIN_ONLY } from '@/constants/roles';
import { useAddPermittedPhones, useDeletePermittedPhone, useFetchPermittedPhones } from '@/hooks/usePermittedPhones';
import { AlertCircleIcon, Phone, Plus, Search, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const PermittedPhonesPage = () => {
  const [singlePhone, setSinglePhone] = useState('');
  const [singleName, setSingleName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [search, setSearch] = useState('');

  const { data: phones, isLoading } = useFetchPermittedPhones(search || undefined);
  const addMutation = useAddPermittedPhones();
  const deleteMutation = useDeletePermittedPhone();

  const handleAddSingle = () => {
    if (!singlePhone.trim()) return;
    addMutation.mutate(
      { phones: [{ phone_number: singlePhone.trim(), full_name: singleName.trim() }] },
      {
        onSuccess: () => {
          toast.success('Phone number added successfully');
          setSinglePhone('');
          setSingleName('');
        },
        onError: err => toast.error(err.message),
      }
    );
  };

  const handleAddBulk = () => {
    const lines = bulkText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    const phones = lines.map(line => {
      // Support "phone_number,full_name" or just "phone_number"
      const [phone, ...nameParts] = line.split(',');
      return {
        phone_number: phone.trim(),
        full_name: nameParts.join(',').trim(),
      };
    });

    addMutation.mutate(
      { phones },
      {
        onSuccess: () => {
          toast.success(`${phones.length} numbers added successfully`);
          setBulkText('');
        },
        onError: err => toast.error(err.message),
      }
    );
  };

  const handleDelete = (id: string, phoneNumber: string) => {
    if (!confirm(`Delete number ${phoneNumber}?`)) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Number deleted'),
      onError: err => toast.error(err.message),
    });
  };

  return (
    <PageContent allowedRoles={SUPERADMIN_ONLY}>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/' },
          { label: 'Permitted Phones', link: '/permitted-phones' },
        ]}
      />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
          <Phone className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <h2 className="text-tanakayu-text font-sans text-2xl font-bold">Permitted Phones</h2>
          <p className="text-tanakayu-text text-sm">Only phone numbers registered here can register an account.</p>
        </div>
      </div>

      {/* Add Phone Form */}
      <Card className="gap-4">
        <CardHeader>
          <div className="grid grid-cols-2 gap-2">
            <Button variant={mode === 'single' ? 'default' : 'outline'} size="lg" onClick={() => setMode('single')}>
              <Plus className="mr-1 h-4 w-4" /> Single
            </Button>
            <Button variant={mode === 'bulk' ? 'default' : 'outline'} size="lg" onClick={() => setMode('bulk')}>
              <Upload className="mr-1 h-4 w-4" /> Bulk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mode === 'single' ? (
            <div className="flex flex-col gap-3">
              <div className="grid gap-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g. 087788000000"
                  value={singlePhone}
                  onChange={e => setSinglePhone(e.target.value)}
                  disabled={addMutation.isPending}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  placeholder="Number owner's name"
                  value={singleName}
                  onChange={e => setSingleName(e.target.value)}
                  disabled={addMutation.isPending}
                />
              </div>
              <Button onClick={handleAddSingle} disabled={addMutation.isPending || !singlePhone.trim()}>
                {addMutation.isPending ? 'Adding...' : 'Add'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid gap-1">
                <Label htmlFor="bulk">One number per line (format: number,name)</Label>
                <Textarea
                  id="bulk"
                  placeholder={'087788000001,Budi Santoso\n087788000002,Siti Aminah\n087788000003'}
                  rows={6}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  disabled={addMutation.isPending}
                />
              </div>
              <Button onClick={handleAddBulk} disabled={addMutation.isPending || !bulkText.trim()}>
                {addMutation.isPending ? 'Adding...' : 'Add All'}
              </Button>
            </div>
          )}

          {addMutation.isError && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>{addMutation.error.message}</AlertTitle>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search number or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Phone List */}
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-base">All Numbers ({phones?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingIndicator isLoading={isLoading} />
          {!isLoading && phones?.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">No registered numbers yet</p>
          )}
          <div className="divide-y">
            {phones?.map(phone => (
              <div key={phone.id} className="flex items-center gap-3 py-3 transition-colors hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-medium">{phone.phoneNumber}</p>
                  {phone.fullName && <p className="text-muted-foreground text-xs">{phone.fullName}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(phone.id, phone.phoneNumber)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
};

export default PermittedPhonesPage;
