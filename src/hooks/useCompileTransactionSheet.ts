import { UploadTransactionResult } from '@/types';
import { useMutation } from '@tanstack/react-query';

const compileTransactionSheet = async (file: File): Promise<UploadTransactionResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/compile-sheet', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to compile transaction sheet');
  }

  return response.json();
};

export const useCompileTransactionSheet = () => {
  return useMutation({
    mutationKey: ['compile-transaction-sheet'],
    mutationFn: compileTransactionSheet,
  });
};
