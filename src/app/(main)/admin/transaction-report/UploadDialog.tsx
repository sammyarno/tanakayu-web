'use client';

import { useState } from 'react';

import TransactionCard from '@/components/TransactionCard';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/auth/useAuth';
import { useBulkCreateTransactions } from '@/hooks/useBulkCreateTransactions';
import { useCompileTransactionSheet } from '@/hooks/useCompileTransactionSheet';
import type { UploadTransactionResult } from '@/types/transaction';
import { AlertCircleIcon, FileSpreadsheetIcon } from 'lucide-react';
import { toast } from 'sonner';

const UploadDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadTransactionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();
  const { mutateAsync, isPending } = useCompileTransactionSheet();
  const { mutateAsync: bulkCreateTransactions, isPending: isSaving } = useBulkCreateTransactions();
  const { username } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setErrorMessage(undefined);

      // Automatically upload on file selection
      await handleUpload(file);
    }
  };

  const handleUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) {
      setErrorMessage('Please select a file to upload');
      return;
    }

    try {
      setErrorMessage(undefined);
      const result = await mutateAsync(fileToUpload);
      setUploadResult(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload file');
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!uploadResult || !username) {
      setErrorMessage('Missing upload data or user information');
      return;
    }

    try {
      setErrorMessage(undefined);

      // Extract all transactions from the upload result
      const allTransactions = uploadResult.transactions.flatMap(dateGroup =>
        dateGroup.details.map(transaction => ({
          amount: transaction.amount,
          category: transaction.category,
          date: transaction.date,
          description: transaction.description || '',
          title: transaction.title,
          type: transaction.type as 'income' | 'expense',
        }))
      );

      const result = await bulkCreateTransactions({
        transactions: allTransactions,
        actor: username,
      });

      toast.success(`${result.count} transactions successfully uploaded`, {
        duration: 3000,
        position: 'top-center',
      });

      // Close dialog and reset states
      setIsOpen(false);
      setSelectedFile(null);
      setUploadResult(null);
      setErrorMessage(undefined);

      // Clear file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save transactions');
      console.error('Save error:', error);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMessage(undefined);
  };

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedFile(null);
      setUploadResult(null);
      setErrorMessage(undefined);

      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} size="lg" className="flex-1 tracking-wide" variant="outline">
          <FileSpreadsheetIcon className="size-4" />
          Upload Excel/CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Transaction Sheet</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-3">
              <Label htmlFor="file">Select Excel or CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls,.xlsb,.csv"
                onChange={handleFileChange}
                disabled={isPending}
              />
              {selectedFile && (
                <p className="text-muted-foreground text-sm">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {errorMessage && (
              <Alert variant="destructive" className="border-red-600 bg-red-300/40">
                <AlertCircleIcon />
                <AlertTitle className="tracking-wider capitalize">{errorMessage}</AlertTitle>
              </Alert>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <Label>Data Preview</Label>
            {isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="mt-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex space-x-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ) : uploadResult ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 font-semibold">Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-muted-foreground">Transactions</p>
                      <p className="font-medium">{uploadResult.summary.totalTransactions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Income</p>
                      <p className="font-medium text-green-600">{uploadResult.summary.totalIncome}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Expense</p>
                      <p className="font-medium text-red-600">{uploadResult.summary.totalExpense}</p>
                    </div>
                  </div>
                </div>

                {/* Transactions by Date */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Transactions by Date</h3>
                  <div className="max-h-[400px] space-y-3 overflow-y-auto">
                    {uploadResult.transactions.map(dateGroup => (
                      <TransactionCard key={dateGroup.date} dayGroup={dateGroup} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground italic">Data preview will be shown here</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Section */}
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleCancel} disabled={isPending || isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!uploadResult || isPending || isSaving || !username}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
