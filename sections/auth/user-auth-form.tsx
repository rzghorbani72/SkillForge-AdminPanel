'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLogin } from '@/hooks/useLogin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const formSchema = z.object({
  identifier: z
    .string()
    .min(9, { message: 'Enter a valid email or phone number' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const { login, loading, error } = useLogin();
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: { identifier: '', password: '' }
  });

  const onSubmit = (data: UserFormValue) => {
    login(data.identifier, data.password);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
      <div>
        <label>Email or Phone</label>
        <Input
          type="text"
          placeholder="Enter your email or phone..."
          disabled={loading}
          {...form.register('identifier')}
        />
      </div>
      <div>
        <label>Password</label>
        <Input
          type="password"
          placeholder="Enter your password..."
          disabled={loading}
          {...form.register('password')}
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex items-center justify-between">
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot Password?
        </Link>
        <Link
          href="/profile-passwords"
          className="text-sm text-blue-600 hover:underline"
        >
          Manage Profile Passwords
        </Link>
      </div>
      <Button disabled={loading} className="w-full" type="submit">
        Sign In
      </Button>
    </form>
  );
}
