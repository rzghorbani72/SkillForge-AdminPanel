'use client';

import { useState } from 'react';
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
  Globe,
  MapPin,
  Users,
  BookOpen
} from 'lucide-react';
import { ErrorHandler } from '@/lib/error-handler';
import Link from '@/components/ui/link';
import { AuthWideLayout } from '@/components/auth/auth-wide-layout';
import { AuthBrand } from '@/components/auth/auth-brand';
import { useTranslation } from '@/lib/i18n/hooks';

const POPULAR_STORES = [
  {
    name: 'Harvard University',
    domain: 'harvard',
    students: '50K+',
    courses: '500+'
  },
  { name: 'MIT', domain: 'mit', students: '30K+', courses: '300+' },
  {
    name: 'Stanford University',
    domain: 'stanford',
    students: '40K+',
    courses: '400+'
  },
  {
    name: 'Yale University',
    domain: 'yale',
    students: '25K+',
    courses: '250+'
  },
  {
    name: 'Princeton University',
    domain: 'princeton',
    students: '20K+',
    courses: '200+'
  },
  {
    name: 'Columbia University',
    domain: 'columbia',
    students: '35K+',
    courses: '350+'
  }
];

export default function FindStorePage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      ErrorHandler.showWarning(t('findSchool.enterStorePrompt'));
      return;
    }

    setIsSearching(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let domain = searchTerm.trim().toLowerCase();
      if (domain.startsWith('http://') || domain.startsWith('https://')) {
        domain = domain.replace(/^https?:\/\//, '');
      }
      if (domain.startsWith('www.')) {
        domain = domain.replace(/^www\./, '');
      }
      if (domain.endsWith('.skillforge.com')) {
        domain = domain.replace(/\.skillforge\.com$/, '');
      }

      const storeUrl = `https://${domain}.skillforge.com`;
      ErrorHandler.showSuccess(
        t('findSchool.redirectingTo', { url: storeUrl })
      );
      window.location.href = storeUrl;
    } catch (error) {
      console.error('Search error:', error);
      ErrorHandler.showWarning(t('findSchool.searchFailed'));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AuthWideLayout>
      <AuthBrand
        large
        title={t('findSchool.title')}
        subtitle={t('findSchool.subtitle')}
      />

      <div>
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('findSchool.searchTitle')}</CardTitle>
            <CardDescription>
              {t('findSchool.searchDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-search">
                  {t('findSchool.searchLabel')}
                </Label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="store-search"
                    type="text"
                    placeholder={t('findSchool.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    disabled={isSearching}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Search className="me-2 h-4 w-4 animate-spin" />
                    {t('findSchool.searching')}
                  </>
                ) : (
                  <>
                    <ExternalLink className="me-2 h-4 w-4" />
                    {t('findSchool.goToStore')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Examples */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span>{t('findSchool.byDomain')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    {t('findSchool.customDomain')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    https://yourstore.com
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    {t('findSchool.subdomainLabel')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    https://yourstore.skillforge.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-success" />
                <span>{t('findSchool.byStoreName')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    {t('findSchool.fullStoreName')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Harvard University
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    {t('findSchool.shortName')}
                  </p>
                  <p className="text-sm text-muted-foreground">Harvard</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Stores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('findSchool.popularStores')}</CardTitle>
            <CardDescription>
              {t('findSchool.popularStoresDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {POPULAR_STORES.map((store) => (
                <div
                  key={store.domain}
                  className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
                  onClick={() => {
                    window.location.href = `https://${store.domain}.skillforge.com`;
                  }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {store.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {store.domain}.skillforge.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {store.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {store.courses}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Alert>
            <AlertDescription>
              <strong>{t('findSchool.cantFindStore')}</strong>{' '}
              {t('findSchool.cantFindStoreHelp')}
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription>
              <strong>{t('findSchool.needToCreateStore')}</strong>{' '}
              {t('findSchool.needToCreateStoreHelp1')}
              <Link
                href="/register"
                className="text-primary underline hover:text-primary"
              >
                {t('findSchool.registerHere')}
              </Link>
              {t('findSchool.needToCreateStoreHelp2')}
            </AlertDescription>
          </Alert>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 space-y-4 text-center">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button variant="outline">{t('findSchool.backToLogin')}</Button>
            </Link>
            <Link href="/register">
              <Button>{t('findSchool.createNewStore')}</Button>
            </Link>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {t('findSchool.needHelp')}{' '}
            <a
              href="/support"
              className="text-primary underline hover:text-primary"
            >
              {t('findSchool.contactSupport')}
            </a>
          </p>
        </div>
      </div>
    </AuthWideLayout>
  );
}
