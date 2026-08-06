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
import type { Academy } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useRouter } from 'next/navigation';
import { AuthWideLayout } from '@/components/auth/auth-wide-layout';
import { AuthBrand } from '@/components/auth/auth-brand';
import { useTranslation } from '@/lib/i18n/hooks';

export default function SelectStorePage() {
  const { t } = useTranslation();
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
        const userStores = await authService.getUserAcademies();

        if (userStores.length === 0) {
          ErrorHandler.showWarning(t('selectSchool.noStoresFound'));
          router.push('/login');
          return;
        }

        if (userStores.length === 1) {
          window.location.href = '/dashboard';
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
  }, [router, t]);

  useEffect(() => {
    // Filter stores based on search term
    const filtered = stores.filter(
      (store) =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStores(filtered);
  }, [searchTerm, stores]);

  const handleStoreSelect = (academy: Academy) => {
    const storeUrl = authService.getAcademyDashboardUrl(academy);
    ErrorHandler.showInfo(
      t('selectSchool.redirectingTo', { name: academy.name })
    );
    window.location.href = storeUrl;
  };

  const handleLogout = async () => {
    await authService.logout();
  };

  if (isLoading) {
    return (
      <AuthWideLayout>
        <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('selectSchool.loading')}</span>
        </div>
      </AuthWideLayout>
    );
  }

  return (
    <AuthWideLayout>
      <AuthBrand
        large
        title={t('selectSchool.title')}
        subtitle={t('selectSchool.subtitle')}
      />
      <div>
        {user &&
        typeof user === 'object' &&
        'user' in user &&
        user.user &&
        typeof user.user === 'object' &&
        'name' in user.user ? (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            {t('selectSchool.welcomeBack', {
              name: (user.user as { name?: string }).name ?? 'User'
            })}
          </p>
        ) : null}

        {/* Search */}
        <div className="mb-6">
          <Label htmlFor="search" className="sr-only">
            {t('selectSchool.searchLabel')}
          </Label>
          <div className="relative">
            <Search className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder={t('selectSchool.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10"
            />
          </div>
        </div>

        {/* Stores Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((academy) => (
            <Card
              key={academy.id}
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => handleStoreSelect(academy)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{academy.name}</CardTitle>
                    <CardDescription>
                      {academy.slug}.skillforge.com
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('selectSchool.status')}
                    </span>
                    <span className="font-medium text-success">
                      {t('selectSchool.active')}
                    </span>
                  </div>
                  {(academy.domain?.public_address ||
                    (academy as { Domain?: { public_address?: string } }).Domain
                      ?.public_address) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t('selectSchool.domain')}
                      </span>
                      <span className="font-medium text-primary">
                        {academy.domain?.public_address ||
                          (academy as { Domain?: { public_address?: string } })
                            .Domain?.public_address}
                      </span>
                    </div>
                  )}
                </div>
                <Button className="mt-4 w-full" variant="outline">
                  <ExternalLink className="me-2 h-4 w-4" />
                  {t('selectSchool.accessAcademy')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredStores.length === 0 && searchTerm && (
          <Card className="py-8 text-center">
            <CardContent>
              <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-foreground">
                {t('selectSchool.noResultsTitle')}
              </h3>
              <p className="mb-4 text-muted-foreground">
                {t('selectSchool.noResultsMessage', { term: searchTerm })}
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                {t('selectSchool.clearSearch')}
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
            {t('selectSchool.signOut')}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/dashboard';
            }}
            className="w-full sm:w-auto"
          >
            {t('selectSchool.accessAdminPanel')}
          </Button>
        </div>

        {/* Info Alert */}
        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('selectSchool.needHelp')}</strong>{' '}
            {t('selectSchool.needHelpText')}{' '}
            <a
              href="/support"
              className="text-primary underline hover:text-primary"
            >
              {t('selectSchool.contactSupport')}
            </a>
            .
          </AlertDescription>
        </Alert>
      </div>
    </AuthWideLayout>
  );
}
