'use client';

import { FormEvent, useEffect, useState } from 'react';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateTransaction } from '@/hooks/useCreateTransaction';
import { AlertCircleIcon } from 'lucide-react';

const CATEGORY_OPTIONS = {
  'iuran warga': 'income',
  'kegiatan sosial / keagamaan': 'expense',
  'perawatan lingkungan': 'expense',
  'uang operasional': 'expense',
  donasi: 'income',
  'lain lain': null, // user can choose type
} as const;

type CategoryKey = keyof typeof CATEGORY_OPTIONS;

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>('');
  const { mutateAsync, isPending } = useCreateTransaction();
  const { displayName } = useAuth();

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const categoryType = CATEGORY_OPTIONS[category as CategoryKey];
    if (categoryType) {
      setTransactionType(categoryType);
    } else {
      setTransactionType(''); // Reset for 'lain lain'
    }
  };

  const handleCreateSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(undefined);
    const formData = new FormData(e.currentTarget);

    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const amount = formData.get('amount')?.toString();
    const date = formData.get('date')?.toString();

    if (!title || !amount || !selectedCategory || !transactionType || !date) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    try {
      await mutateAsync({
        title,
        description: description || undefined,
        amount: amountNumber,
        category: selectedCategory,
        type: transactionType as 'income' | 'expense',
        actor: displayName || '',
        date,
      });

      setIsOpen(false);
      setErrorMessage(undefined);
      setSelectedCategory('');
      setTransactionType('');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setErrorMessage('Failed to create transaction');
      console.error(error);
    }
  };

  const handleFormError = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('Invalid form submission');
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory('');
      setTransactionType('');
      setErrorMessage(undefined);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} size="lg" className="tracking-wide">
          Tambah Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Transaction</DialogTitle>
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
                placeholder="Enter transaction title"
                disabled={isPending}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" disabled={isPending} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter transaction description"
                disabled={isPending}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                disabled={isPending}
              />
            </div>
            <div className="flex gap-4">
              <div className="grid flex-1 gap-3">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={handleCategoryChange} disabled={isPending} value={selectedCategory}>
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="capitalize">
                    {Object.keys(CATEGORY_OPTIONS).map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid flex-1 gap-3">
                <Label htmlFor="type">Type</Label>
                {selectedCategory === 'lain lain' ? (
                  <Select onValueChange={setTransactionType} disabled={isPending} value={transactionType}>
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent className="capitalize">
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p
                    className={`font-medium capitalize ${
                      transactionType === 'income'
                        ? 'text-green-600'
                        : transactionType === 'expense'
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {transactionType || '-'}
                  </p>
                )}
              </div>
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
