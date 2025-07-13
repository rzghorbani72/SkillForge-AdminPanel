'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { School, Search, ExternalLink, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import { authService, UserSchool } from '@/lib/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SelectSchoolPage() {
  const [schools, setSchools] = useState<UserSchool[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<UserSchool[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const loadUserSchools = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }

        setUser(currentUser);

        // Check if user should be redirected to school (students)
        if (authService.shouldRedirectToSchool(currentUser)) {
          const userSchools = await authService.getUserSchools();
          
          if (userSchools.length === 0) {
            toast.error('No schools found for your account');
            router.push('/login');
            return;
          }

          if (userSchools.length === 1) {
            // Only one school, redirect directly
            const schoolUrl = authService.getSchoolDashboardUrl(userSchools[0].school);
            window.location.href = schoolUrl;
            return;
          }

          // Multiple schools, show selection
          setSchools(userSchools);
          setFilteredSchools(userSchools);
        } else {
          // User is admin/manager/teacher, redirect to admin panel
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Failed to load schools:', error);
        toast.error('Failed to load your schools');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSchools();
  }, [router]);

  useEffect(() => {
    // Filter schools based on search term
    const filtered = schools.filter(school =>
      school.school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.school.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSchools(filtered);
  }, [searchTerm, schools]);

  const handleSchoolSelect = (userSchool: UserSchool) => {
    const schoolUrl = authService.getSchoolDashboardUrl(userSchool.school);
    toast.info(`Redirecting to ${userSchool.school.name}...`);
    window.location.href = schoolUrl;
  };

  const handleLogout = async () => {
    await authService.logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your schools...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your School</h1>
          <p className="text-gray-600">
            You're enrolled in multiple schools. Choose which one you'd like to access.
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Welcome back, {user.user.name}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <Label htmlFor="search" className="sr-only">
            Search schools
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Search your schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredSchools.map((userSchool) => (
            <Card 
              key={userSchool.school.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleSchoolSelect(userSchool)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <School className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{userSchool.school.name}</CardTitle>
                    <CardDescription>
                      {userSchool.school.slug}.skillforge.com
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Your Role:</span>
                    <span className="font-medium capitalize">
                      {userSchool.profile.role?.name || 'Student'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  {userSchool.school.domain?.public_address && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Domain:</span>
                      <span className="font-medium text-blue-600">
                        {userSchool.school.domain.public_address}
                      </span>
                    </div>
                  )}
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Access School
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredSchools.length === 0 && searchTerm && (
          <Card className="text-center py-8">
            <CardContent>
              <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
              <p className="text-gray-600 mb-4">
                No schools match your search for "{searchTerm}"
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
            <strong>Need help?</strong> If you can't find your school or need to enroll in a new one, 
            please contact your school administrator or{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-500 underline">
              contact support
            </a>.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
} 