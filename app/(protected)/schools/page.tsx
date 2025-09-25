'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Search, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { School } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';

export default function SchoolsPage() {
  const { schools, updateSchoolsList } = useSchool();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    private_domain: '',
    public_domain: '',
    description: ''
  });

  // Domain validation state
  const [domainValidation, setDomainValidation] = useState({
    isValid: false,
    message: ''
  });

  // Domain availability state
  const [domainAvailability, setDomainAvailability] = useState({
    isChecking: false,
    isAvailable: false,
    message: ''
  });

  // Reset form state
  const resetFormState = () => {
    setFormData({
      name: '',
      private_domain: '',
      public_domain: '',
      description: ''
    });
    setDomainValidation({ isValid: false, message: '' });
    setDomainAvailability({
      isChecking: false,
      isAvailable: false,
      message: ''
    });
  };

  // Monitor formData changes for validation
  useEffect(() => {
    // Only validate if we have a domain and a selected school (editing mode)
    if (formData.private_domain && selectedSchool && isEditDialogOpen) {
      validateDomain(formData.private_domain);
    }
  }, [formData.private_domain, selectedSchool, isEditDialogOpen]);

  // Extract and format the first part of domain (before the dot)
  const extractDomainPart = (domain: string): string => {
    if (!domain) return '';
    // Remove .skillforge.com or any domain suffix
    const cleanDomain = domain
      .replace(/\.skillforge\.com$/i, '')
      .replace(/\./g, '');

    if (!cleanDomain) return '';
    return cleanDomain
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Convert domain to standard format (lowercase, kebab-case)
  const formatDomain = (domain: string): string => {
    if (!domain) return '';
    return domain
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Validate domain format and length
  const validateDomain = (domain: string) => {
    // Format the domain to standard format
    const formattedDomain = formatDomain(domain);

    if (formattedDomain.length < 5) {
      setDomainValidation({
        isValid: false,
        message: 'Domain must be at least 5 characters long'
      });
      setDomainAvailability({
        isChecking: false,
        isAvailable: false,
        message: ''
      });
      return;
    }

    // Check domain availability using formatted domain
    checkDomainAvailability(formattedDomain);
  };

  // Check if domain is available and unique
  const checkDomainAvailability = (domain: string) => {
    if (!domain) return;

    setDomainAvailability({
      isChecking: true,
      isAvailable: false,
      message: 'Checking domain availability...'
    });

    // Simulate API call delay
    setTimeout(() => {
      // Check if domain already exists in other schools (exclude current school when editing)
      const isTaken = schools.some((school) => {
        const schoolDomainPart = extractDomainPart(
          school.domain?.private_address || ''
        );
        const inputDomainPart = extractDomainPart(domain);
        return (
          schoolDomainPart === inputDomainPart &&
          school.id !== (selectedSchool?.id || 0)
        );
      });

      if (
        selectedSchool &&
        extractDomainPart(domain) ===
          extractDomainPart(selectedSchool.domain?.private_address || '')
      ) {
        setDomainAvailability({
          isChecking: false,
          isAvailable: true,
          message: 'This is your current domain name'
        });
      } else if (isTaken) {
        setDomainAvailability({
          isChecking: false,
          isAvailable: false,
          message: 'This domain name is already taken by another school'
        });
      } else {
        setDomainAvailability({
          isChecking: false,
          isAvailable: true,
          message: 'Domain name is available and unique'
        });
      }
    }, 500);
  };

  const handleCreateSchool = async () => {
    try {
      if (!formData.name) {
        ErrorHandler.showWarning('School name is required');
        return;
      }

      if (!formData.private_domain) {
        ErrorHandler.showWarning(
          'Domain name is required. Each school must have a unique domain name.'
        );
        return;
      }

      // Check if domain is available and unique
      if (!domainAvailability.isAvailable) {
        ErrorHandler.showWarning(
          'Please choose a unique domain name that is not already taken'
        );
        return;
      }

      // Double-check uniqueness against existing schools (for create, check all schools)
      const isDomainTaken = schools.some((school) => {
        const schoolDomainPart = extractDomainPart(
          school.domain?.private_address || ''
        );
        const inputDomainPart = extractDomainPart(formData.private_domain);
        return schoolDomainPart === inputDomainPart;
      });
      if (isDomainTaken) {
        ErrorHandler.showWarning(
          'This domain name is already taken by another school. Please choose a unique domain name.'
        );
        return;
      }

      setIsLoading(true);

      const schoolData = {
        name: formData.name,
        private_domain: `${formatDomain(formData.private_domain)}.skillforge.com`,
        description: formData.description
      };

      await apiClient.createSchool(schoolData);
      ErrorHandler.showSuccess('School created successfully');

      // Refresh schools list from context
      const response = await apiClient.getMySchools();
      if (response.status === 200 && response.data) {
        let newSchools: School[] = [];
        const responseData = response.data as any;
        if (responseData.status === 'ok' && responseData.data) {
          newSchools = responseData.data;
        } else if (Array.isArray(responseData)) {
          newSchools = responseData;
        }
        updateSchoolsList(newSchools);
      }

      setIsCreateDialogOpen(false);
      resetFormState();
    } catch (error) {
      console.error('Error creating school:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSchool = async () => {
    try {
      if (!selectedSchool) {
        console.error('No school selected for update');
        return;
      }

      if (!formData.name) {
        ErrorHandler.showWarning('School name is required');
        return;
      }

      if (!formData.private_domain) {
        ErrorHandler.showWarning(
          'Domain name is required. Each school must have a unique domain name.'
        );
        return;
      }

      // Check if domain is available and unique
      if (!domainAvailability.isAvailable) {
        ErrorHandler.showWarning(
          'Please choose a unique domain name that is not already taken'
        );
        return;
      }

      // Double-check uniqueness against existing schools (excluding current school)
      const isDomainTaken = schools.some((school) => {
        if (!school.domain) return false;
        const schoolDomainPart = extractDomainPart(
          school.domain?.private_address || ''
        );
        const inputDomainPart = extractDomainPart(formData.private_domain);
        return (
          schoolDomainPart === inputDomainPart &&
          school.id !== selectedSchool.id
        );
      });
      if (isDomainTaken) {
        ErrorHandler.showWarning(
          'This domain name is already taken by another school. Please choose a unique domain name.'
        );
        return;
      }

      setIsLoading(true);

      const updateData: any = {};
      if (formData.name) updateData.name = formData.name;
      if (formData.private_domain)
        updateData.private_domain = `${formatDomain(formData.private_domain)}.skillforge.com`;
      if (formData.description !== undefined)
        updateData.description = formData.description;

      await apiClient.updateSchool(updateData);
      ErrorHandler.showSuccess('School updated successfully');

      // Refresh schools list from context
      const response = await apiClient.getMySchools();
      if (response.status === 200 && response.data) {
        let newSchools: School[] = [];
        const responseData = response.data as any;
        if (responseData.status === 'ok' && responseData.data) {
          newSchools = responseData.data;
        } else if (Array.isArray(responseData)) {
          newSchools = responseData;
        }
        updateSchoolsList(newSchools);
      }

      setIsEditDialogOpen(false);
      resetFormState();
      setSelectedSchool(null);
    } catch (error) {
      console.error('Error updating school:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while schools are being fetched
  if (!schools) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading schools...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schools Management
          </h1>
          <p className="text-muted-foreground">
            Manage your schools and their settings
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create School
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New School</DialogTitle>
              <DialogDescription>
                Create a new school with a unique domain name
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter school name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain Name * (Must be unique)</Label>
                <Input
                  id="domain"
                  value={formData.private_domain}
                  onChange={(e) => {
                    const formattedValue = formatDomain(e.target.value);
                    setFormData({
                      ...formData,
                      private_domain: formattedValue
                    });
                    validateDomain(formattedValue);
                  }}
                  placeholder="Enter domain name (auto-formatted to lowercase, kebab-case)"
                  className={
                    domainValidation.message
                      ? domainValidation.isValid
                        ? 'border-green-500'
                        : 'border-red-500'
                      : ''
                  }
                />
                {domainValidation.message && (
                  <p
                    className={`text-xs ${
                      domainValidation.isValid
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {domainValidation.message}
                  </p>
                )}
                {domainAvailability.message && (
                  <p
                    className={`text-xs ${
                      domainAvailability.isAvailable
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {domainAvailability.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This will be your school&apos;s URL:{' '}
                  {formData.private_domain
                    ? `${formData.private_domain}.skillforge.com`
                    : 'your-domain.skillforge.com'}
                </p>
                <p className="text-xs font-medium text-orange-600">
                  ⚠️ Each school must have a unique domain name
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your school"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateSchool}
                disabled={
                  !formData.name ||
                  !formData.private_domain ||
                  !domainValidation.isValid ||
                  !domainAvailability.isAvailable ||
                  domainAvailability.isChecking ||
                  isLoading
                }
              >
                {isLoading ? 'Creating...' : 'Create School'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Schools Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(schools || []).map((school) => (
          <Card key={school.id}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {school?.name || 'Unnamed School'}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {school?.domain?.private_address ||
                      `${school?.slug || 'unknown'}.skillforge.com`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {school?.description || 'No description provided'}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {school?.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newFormData = {
                          name: school?.name || '',
                          private_domain: extractDomainPart(
                            school?.domain?.private_address || ''
                          ),
                          public_domain: school?.domain?.public_address || '',
                          description: school?.description || ''
                        };

                        setSelectedSchool(school);
                        setFormData(newFormData);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit School</DialogTitle>
                      <DialogDescription>
                        Update school information and settings
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-name">School Name *</Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Enter school name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-domain">
                          Domain Name * (Must be unique)
                        </Label>
                        <Input
                          id="edit-domain"
                          value={formData.private_domain}
                          onChange={(e) => {
                            const formattedValue = formatDomain(e.target.value);
                            setFormData({
                              ...formData,
                              private_domain: formattedValue
                            });
                            validateDomain(formattedValue);
                          }}
                          placeholder="Enter domain name (auto-formatted to lowercase, kebab-case)"
                          className={
                            domainValidation.message
                              ? domainValidation.isValid
                                ? 'border-green-500'
                                : 'border-red-500'
                              : ''
                          }
                        />
                        {domainValidation.message && (
                          <p
                            className={`text-xs ${
                              domainValidation.isValid
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {domainValidation.message}
                          </p>
                        )}
                        {domainAvailability.message && (
                          <p
                            className={`text-xs ${
                              domainAvailability.isAvailable
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {domainAvailability.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          This will be your school&apos;s URL:{' '}
                          {formData.private_domain
                            ? `${formData.private_domain}.skillforge.com`
                            : 'your-domain.skillforge.com'}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-public-domain">
                          Public Domain (Optional)
                        </Label>
                        <Input
                          id="edit-public-domain"
                          value={formData.public_domain}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              public_domain: e.target.value
                            })
                          }
                          placeholder="Enter public domain (e.g., www.myschool.com)"
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional custom domain for your school
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value
                            })
                          }
                          placeholder="Describe your school"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleUpdateSchool}
                        disabled={
                          !formData.name ||
                          !formData.private_domain ||
                          !domainValidation.isValid ||
                          !domainAvailability.isAvailable ||
                          domainAvailability.isChecking ||
                          isLoading
                        }
                      >
                        {isLoading ? 'Updating...' : 'Update School'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {schools.length === 0 && (
        <div className="py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No schools found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm
              ? 'No schools match your search criteria.'
              : 'Get started by creating your first school.'}
          </p>
        </div>
      )}
    </div>
  );
}
