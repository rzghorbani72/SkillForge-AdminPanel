'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { ErrorHandler } from '@/lib/error-handler';
import { useRouter } from 'next/navigation';

export default function SelectStorePage() {
  const [stores, setStores] = useState<any[]>([]);
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);

  const router = useRouter();

  useEffect(() => {
    const loadUserStores = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }

        setUser(currentUser);

        // Load user's stores for selection
        const userStores = await authService.getUserStores();

        if (userStores.length === 0) {
          ErrorHandler.showWarning('No stores found for your account');
          router.push('/login');
          return;
        }

        if (userStores.length === 1) {
          // Only one store, redirect directly to dashboard
          router.push('/dashboard');
          return;
        }

        // Multiple stores, show selection
        setStores(userStores);
        setFilteredStores(userStores);
      } catch (error) {
        console.error('Failed to load stores:', error);
        ErrorHandler.handleApiError(error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserStores();
  }, [router]);

  useEffect(() => {
    // Filter stores based on search term
    const filtered = stores.filter(
      (store) =>
        store.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.store.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStores(filtered);
  }, [searchTerm, stores]);

  const handleStoreSelect = (userStore: any) => {
    const storeUrl = authService.getStoreDashboardUrl(userStore.store);
    ErrorHandler.showInfo(`Redirecting to ${userStore.store.name}...`);
    window.location.href = storeUrl;
  };

  const handleLogout = async () => {
    await authService.logout();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your stores...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Select Your Store
          </h1>
          <p className="text-gray-600">
            You&apos;re enrolled in multiple stores. Choose which one you&apos;d
            like to access.
          </p>
          {user &&
          typeof user === 'object' &&
          'user' in user &&
          user.user &&
          typeof user.user === 'object' &&
          'name' in user.user ? (
            <p className="mt-2 text-sm text-gray-500">
              Welcome back, {(user.user as { name?: string }).name ?? 'User'}
            </p>
          ) : null}
        </div>

        {/* Search */}
        <div className="mb-6">
          <Label htmlFor="search" className="sr-only">
            Search stores
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Search your stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stores Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((userStore) => (
            <Card
              key={userStore.store.id}
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => handleStoreSelect(userStore)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {userStore.store.name}
                    </CardTitle>
                    <CardDescription>
                      {userStore.store.slug}.skillforge.com
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Your Role:</span>
                    <span className="font-medium capitalize">
                      {userStore.profile.role?.name || 'Student'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                  {userStore.store.domain?.public_address && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Domain:</span>
                      <span className="font-medium text-blue-600">
                        {userStore.store.domain.public_address}
                      </span>
                    </div>
                  )}
                </div>
                <Button className="mt-4 w-full" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Access Store
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredStores.length === 0 && searchTerm && (
          <Card className="py-8 text-center">
            <CardContent>
              <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No stores found
              </h3>
              <p className="mb-4 text-gray-600">
                No stores match your search for &quot;{searchTerm}&quot;
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            Sign out
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto"
          >
            Access Admin Panel
          </Button>
        </div>

        {/* Info Alert */}
        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Need help?</strong> If you can&apos;t find your store or
            need to enroll in a new one, please contact your store administrator
            or{' '}
            <a
              href="/support"
              className="text-blue-600 underline hover:text-blue-500"
            >
              contact support
            </a>
            .
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
