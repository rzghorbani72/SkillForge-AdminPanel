import React from 'react';

const LoadingState = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading course...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
