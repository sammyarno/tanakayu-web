import { FC } from 'react';

interface LoadingIndicatorProps {
  isLoading: boolean;
  fullPage?: boolean;
}

const LoadingIndicator: FC<LoadingIndicatorProps> = ({ isLoading, fullPage = false }) => {
  if (!isLoading) return null;
  
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-md shadow-lg flex items-center gap-2">
          <div className="animate-spin h-5 w-5 border-2 border-tanakayu-highlight rounded-full border-t-transparent"></div>
          <span>Memuat...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center py-2">
      <div className="animate-spin h-4 w-4 border-2 border-tanakayu-highlight rounded-full border-t-transparent"></div>
      <span className="ml-2 text-sm text-gray-600">Memuat...</span>
    </div>
  );
};

export default LoadingIndicator;