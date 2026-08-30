import React from 'react';

export default function PageContainer({
  children
}: {
  children: React.ReactNode;
  /** Kept for callers; the shell already owns vertical scroll. */
  scrollable?: boolean;
}) {
  return <div className="min-w-0 p-4 md:px-8">{children}</div>;
}
