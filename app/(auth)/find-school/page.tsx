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

export default function FindStorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      ErrorHandler.showWarning('Please enter a store name or domain');
      return;
    }

    setIsSearching(true);

    try {
      // This would call the backend API to search for stores
      // For now, we'll simulate the search
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Extract domain from search term
      let domain = searchTerm.trim().toLowerCase();

      // Remove protocol if present
      if (domain.startsWith('http://') || domain.startsWith('https://')) {
        domain = domain.replace(/^https?:\/\//, '');
      }

      // Remove www. if present
      if (domain.startsWith('www.')) {
        domain = domain.replace(/^www\./, '');
      }

      // Remove .skillforge.com if present
      if (domain.endsWith('.skillforge.com')) {
        domain = domain.replace(/\.skillforge\.com$/, '');
      }

      // Construct the store URL
      const storeUrl = `https://${domain}.skillforge.com`;

      ErrorHandler.showSuccess(`Redirecting to ${storeUrl}`);
      window.location.href = storeUrl;
    } catch (error) {
      console.error('Search error:', error);
      ErrorHandler.showWarning(
        'Failed to find store. Please check the domain or contact support.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Find Your Store
          </h1>
          <p className="text-muted-foreground">
            Enter your store&apos;s domain or name to access your learning
            dashboard
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search for Your Store</CardTitle>
            <CardDescription>
              Enter your store&apos;s domain (e.g., mystore.skillforge.com) or
              store name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-search">Store Domain or Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="store-search"
                    type="text"
                    placeholder="e.g., mystore.skillforge.com or My Store Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={isSearching}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Search className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Go to Store
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
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-primary" />
                <span>By Domain</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    Custom Domain
                  </p>
                  <p className="text-sm text-muted-foreground">
                    https://yourstore.com
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    آکادمی Subdomain
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
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-success" />
                <span>By Store Name</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    Full Store Name
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Harvard University
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-foreground">
                    Short Name
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
            <CardTitle>Popular Stores</CardTitle>
            <CardDescription>
              Quick access to some of the most popular stores on آکادمی
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Harvard University',
                  domain: 'harvard',
                  students: '50K+',
                  courses: '500+'
                },
                {
                  name: 'MIT',
                  domain: 'mit',
                  students: '30K+',
                  courses: '300+'
                },
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
              ].map((store) => (
                <div
                  key={store.domain}
                  className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
                  onClick={() => {
                    const storeUrl = `https://${store.domain}.skillforge.com`;
                    window.location.href = storeUrl;
                  }}
                >
                  <div className="mb-3 flex items-center space-x-3">
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
                    <span className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {store.students}
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="mr-1 h-4 w-4" />
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
              <strong>Can&apos;t find your store?</strong> Contact your store
              administrator to get the correct domain or ask them to set up a
              آکادمی account.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription>
              <strong>Need to create a store?</strong> If you&apos;re a teacher
              or administrator, you can{' '}
              <Link
                href="/register"
                className="text-primary underline hover:text-primary"
              >
                register here
              </Link>{' '}
              to create your own store on آکادمی.
            </AlertDescription>
          </Alert>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 space-y-4 text-center">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
            <Link href="/register">
              <Button>Create New Store</Button>
            </Link>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Need help?{' '}
            <a
              href="/support"
              className="text-primary underline hover:text-primary"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
