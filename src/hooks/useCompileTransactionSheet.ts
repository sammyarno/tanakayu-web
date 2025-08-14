import { customFetch } from '@/lib/fetch';
import type { UploadTransactionResult } from '@/types/transaction';
import { useMutation } from '@tanstack/react-query';

const compileTransactionSheet = async (file: File): Promise<UploadTransactionResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await customFetch('/api/transactions/compile-sheet', {
    method: 'POST',
    body: formData,
  });

  if (response.error || !response.data) {
    throw new Error(response.error || 'Failed to compile transaction sheet');
  }

  return response.data;
};

export const useCompileTransactionSheet = () => {
  return useMutation({
    mutationKey: ['compile-transaction-sheet'],
    mutationFn: compileTransactionSheet,
  });
};
