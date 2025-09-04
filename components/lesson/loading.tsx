import React from 'react';

const Loading = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading lessons...</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
