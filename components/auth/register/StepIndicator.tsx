'use client';

interface StepIndicatorProps {
  current: 'verification' | 'form';
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="flex justify-center border-b p-4">
      <div className="flex items-center space-x-4">
        <div
          className={`flex items-center space-x-2 ${current === 'verification' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${current === 'verification' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            1
          </div>
          <span className="font-medium">Verification</span>
        </div>
        <div className="h-0.5 w-8 bg-gray-300"></div>
        <div
          className={`flex items-center space-x-2 ${current === 'form' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${current === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            2
          </div>
          <span className="font-medium">Base Data</span>
        </div>
      </div>
    </div>
  );
}
