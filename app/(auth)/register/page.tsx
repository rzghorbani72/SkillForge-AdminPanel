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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  School,
  Loader2,
  AlertCircle,
  User,
  Building
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationType, setRegistrationType] = useState<
    'new-school' | 'existing-school'
  >('new-school');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    schoolDescription: '',
    schoolSlug: '',
    existingSchoolId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic user validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email && !formData.phone) {
      newErrors.email = 'Either email or phone number is required';
      newErrors.phone = 'Either email or phone number is required';
    } else {
      if (formData.email && !isValidEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (formData.phone && !isValidPhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // School validation based on registration type
    if (registrationType === 'new-school') {
      if (!formData.schoolName.trim()) {
        newErrors.schoolName = 'School name is required';
      }
      if (!formData.schoolSlug.trim()) {
        newErrors.schoolSlug = 'School slug is required';
      } else if (!/^[a-z0-9-]+$/.test(formData.schoolSlug)) {
        newErrors.schoolSlug =
          'School slug can only contain lowercase letters, numbers, and hyphens';
      }
    } else {
      if (!formData.existingSchoolId) {
        newErrors.existingSchoolId = 'Please select a school';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      const userData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone,
        password: formData.password
      };

      await authService.register(userData);

      // Login the user after successful registration
      const credentials = {
        password: formData.password,
        ...(formData.email
          ? { email: formData.email }
          : { phone: formData.phone })
      };

      const user = await authService.login(credentials);

      if (user) {
        toast.success('Registration successful!');

        // Handle school creation or joining
        if (registrationType === 'new-school') {
          // Create new school
          // This would call the backend API to create a school
          toast.info('Creating your school...');
          // Redirect to school setup
          router.push('/dashboard');
        } else {
          // Join existing school
          toast.info('Joining existing school...');
          // Redirect to school dashboard
          router.push('/dashboard');
        }
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      toast.error(
        (error as Error).message || 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const generateSchoolSlug = (schoolName: string) => {
    const slug = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    handleInputChange('schoolSlug', slug);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <School className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SkillForge</h1>
          <p className="text-gray-600">Teacher Registration</p>
        </div>

        {/* Access Notice */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This registration is for{' '}
            <strong>Teachers and Administrators</strong> only. Students should
            register through their school&apos;s website.
          </AlertDescription>
        </Alert>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-center">
              Register as a teacher to start creating and managing courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Registration Type Selection */}
              <div className="space-y-2">
                <Label>Registration Type</Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                      registrationType === 'new-school'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRegistrationType('new-school')}
                  >
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium">Create New School</h3>
                        <p className="text-sm text-gray-600">
                          Start your own educational institution
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                      registrationType === 'existing-school'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRegistrationType('existing-school')}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-green-600" />
                      <div>
                        <h3 className="font-medium">Join Existing School</h3>
                        <p className="text-sm text-gray-600">
                          Join as a teacher at an existing school
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        className={`pl-10 ${
                          errors.email ? 'border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange('phone', e.target.value)
                        }
                        className={`pl-10 ${
                          errors.phone ? 'border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange('password', e.target.value)
                        }
                        className={`pl-10 pr-10 ${
                          errors.password ? 'border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange('confirmPassword', e.target.value)
                        }
                        className={`pl-10 pr-10 ${
                          errors.confirmPassword ? 'border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* School Information */}
              {registrationType === 'new-school' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">School Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      type="text"
                      placeholder="Enter your school name"
                      value={formData.schoolName}
                      onChange={(e) => {
                        handleInputChange('schoolName', e.target.value);
                        generateSchoolSlug(e.target.value);
                      }}
                      className={errors.schoolName ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.schoolName && (
                      <p className="text-sm text-red-500">
                        {errors.schoolName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolSlug">School URL Slug</Label>
                    <div className="relative">
                      <Input
                        id="schoolSlug"
                        type="text"
                        placeholder="your-school-name"
                        value={formData.schoolSlug}
                        onChange={(e) =>
                          handleInputChange('schoolSlug', e.target.value)
                        }
                        className={`pr-20 ${
                          errors.schoolSlug ? 'border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                      <span className="absolute right-3 top-3 text-sm text-gray-500">
                        .skillforge.com
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      This will be your school&apos;s unique URL:{' '}
                      {formData.schoolSlug || 'your-school'}.skillforge.com
                    </p>
                    {errors.schoolSlug && (
                      <p className="text-sm text-red-500">
                        {errors.schoolSlug}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolDescription">
                      School Description (Optional)
                    </Label>
                    <Textarea
                      id="schoolDescription"
                      placeholder="Brief description of your school..."
                      value={formData.schoolDescription}
                      onChange={(e) =>
                        handleInputChange('schoolDescription', e.target.value)
                      }
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {registrationType === 'existing-school' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Join Existing School</h3>

                  <div className="space-y-2">
                    <Label htmlFor="existingSchool">Select School</Label>
                    <Select
                      value={formData.existingSchoolId}
                      onValueChange={(value) =>
                        handleInputChange('existingSchoolId', value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        className={
                          errors.existingSchoolId ? 'border-red-500' : ''
                        }
                      >
                        <SelectValue placeholder="Choose a school to join" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school1">
                          Harvard University
                        </SelectItem>
                        <SelectItem value="school2">MIT</SelectItem>
                        <SelectItem value="school3">
                          Stanford University
                        </SelectItem>
                        <SelectItem value="school4">Yale University</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.existingSchoolId && (
                      <p className="text-sm text-red-500">
                        {errors.existingSchoolId}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
