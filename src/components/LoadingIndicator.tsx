interface LoadingIndicatorProps {
  isLoading: boolean;
}

const LoadingIndicator = ({ isLoading }: LoadingIndicatorProps) => {
  if (!isLoading) return null;

  return (
    <div className="flex items-center justify-center py-2">
      <div className="animate-spin h-4 w-4 border-2 border-tanakayu-highlight rounded-full border-t-transparent"></div>
      <span className="ml-2 text-sm text-foreground">Memuat...</span>
    </div>
  );
};

export default LoadingIndicator;
