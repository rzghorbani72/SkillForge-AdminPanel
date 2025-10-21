'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus, Search, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { School } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchBar } from '@/components/shared/SearchBar';
import { SchoolCard } from '@/components/schools/SchoolCard';
import { SchoolForm } from '@/components/schools/SchoolForm';

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
    return <LoadingSpinner message="Loading schools..." />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Schools Management"
        description="Manage your schools and their settings"
      >
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
            <SchoolForm
              formData={formData}
              onFormDataChange={setFormData}
              domainValidation={domainValidation}
              domainAvailability={domainAvailability}
              isEdit={false}
            />
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
      </PageHeader>

      <SearchBar
        placeholder="Search schools..."
        value={searchTerm}
        onChange={setSearchTerm}
        className="max-w-sm"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(schools || []).map((school) => (
          <SchoolCard
            key={school.id}
            school={school}
            onEdit={(school) => {
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
              setIsEditDialogOpen(true);
            }}
          />
        ))}
      </div>

      {schools.length === 0 && (
        <EmptyState
          icon={<Building2 className="h-12 w-12" />}
          title="No schools found"
          description={
            searchTerm
              ? 'No schools match your search criteria.'
              : 'Get started by creating your first school.'
          }
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
            <DialogDescription>
              Update school information and settings
            </DialogDescription>
          </DialogHeader>
          <SchoolForm
            formData={formData}
            onFormDataChange={setFormData}
            domainValidation={domainValidation}
            domainAvailability={domainAvailability}
            isEdit={true}
          />
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
  );
}
