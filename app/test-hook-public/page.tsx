'use client';

import { useAccessControl } from '@/hooks/useAccessControl';

export default function TestHookPage() {
  const { userState, isLoading, error } = useAccessControl();

  console.log('Test Hook - User State:', userState);
  console.log('Test Hook - Loading:', isLoading);
  console.log('Test Hook - Error:', error);

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Test Access Control Hook</h1>

      <div className="space-y-4">
        <div>
          <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
        </div>

        <div>
          <strong>Error:</strong> {error || 'None'}
        </div>

        <div>
          <strong>User State:</strong>
          <pre className="mt-2 rounded bg-gray-100 p-4">
            {JSON.stringify(userState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
