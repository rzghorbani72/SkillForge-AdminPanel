'use client';

import { ProfilePasswordManager } from '@/components/profile-password-manager';
import { AuthGuard } from '@/components/auth-guard';

export default function ProfilePasswordsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto py-8">
        <ProfilePasswordManager />
      </div>
    </AuthGuard>
  );
}
