'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PhoneInputWithCountry } from '@/components/ui/phone-input-with-country';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Building, Eye, EyeOff, GraduationCap, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SchoolOption {
  id: number;
  name: string;
}

interface BaseDataFormProps {
  registrationType: 'new-school' | 'existing-school';
  setRegistrationType: (t: 'new-school' | 'existing-school') => void;
  formData: any;
  errors: Record<string, string>;
  isLoading: boolean;
  schools: SchoolOption[];
  schoolsLoading: boolean;
  schoolsError?: string;
  joinAsTeacher: boolean;
  setJoinAsTeacher: (b: boolean) => void;
  onChange: (field: string, value: string) => void;
  onGenerateSlug: (name: string) => void;
}

export function BaseDataForm(props: BaseDataFormProps) {
  const {
    registrationType,
    setRegistrationType,
    formData,
    errors,
    isLoading,
    schools,
    schoolsLoading,
    schoolsError,
    joinAsTeacher,
    setJoinAsTeacher,
    onChange,
    onGenerateSlug
  } = props;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-6">
      {/* Registration Type */}
      <div className="space-y-2">
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
                  Start your own educational institution as a manager
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
              <GraduationCap className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium">Join Existing School</h3>
                <p className="text-sm text-gray-600">
                  Join as a student and optionally request teacher role
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
            disabled={isLoading}
          />
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
                onChange={(e) => onChange('password', e.target.value)}
                className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
                onChange={(e) => onChange('confirmPassword', e.target.value)}
                className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* School Information */}
      {registrationType === 'new-school' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schoolName">School Name</Label>
            <Input
              id="schoolName"
              type="text"
              placeholder="Enter your school name"
              value={formData.schoolName}
              onChange={(e) => {
                onChange('schoolName', e.target.value);
                onGenerateSlug(e.target.value);
              }}
              className={errors.schoolName ? 'border-red-500' : ''}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolSlug">School URL Slug</Label>
            <div className="relative">
              <Input
                id="schoolSlug"
                type="text"
                placeholder="your-school-name"
                value={formData.schoolSlug}
                onChange={(e) => onChange('schoolSlug', e.target.value)}
                className={`pr-20 ${errors.schoolSlug ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <span className="absolute right-3 top-3 text-sm text-gray-500">
                .skillforge.com
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolDescription">
              School Description (Optional)
            </Label>
            <Textarea
              id="schoolDescription"
              placeholder="Brief description of your school..."
              value={formData.schoolDescription}
              onChange={(e) => onChange('schoolDescription', e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="existingSchool">Select School</Label>
            <Select
              value={formData.existingSchoolId}
              onValueChange={(value) => onChange('existingSchoolId', value)}
              disabled={isLoading || schoolsLoading}
            >
              <SelectTrigger
                className={errors.existingSchoolId ? 'border-red-500' : ''}
              >
                <SelectValue
                  placeholder={
                    schoolsLoading
                      ? 'Loading schools...'
                      : schoolsError
                        ? 'Error loading schools'
                        : 'Choose a school to join'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id.toString()}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="joinAsTeacher"
                checked={joinAsTeacher}
                onChange={(e) => setJoinAsTeacher(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label
                htmlFor="joinAsTeacher"
                className="flex items-center space-x-2"
              >
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span>Request Teacher Role</span>
              </Label>
            </div>
            {joinAsTeacher && (
              <div className="space-y-2">
                <Label htmlFor="teacherRequestReason">
                  Why do you want to be a teacher?
                </Label>
                <Textarea
                  id="teacherRequestReason"
                  placeholder="Please explain your teaching experience, qualifications, and why you want to teach at this school..."
                  value={formData.teacherRequestReason}
                  onChange={(e) =>
                    onChange('teacherRequestReason', e.target.value)
                  }
                  disabled={isLoading}
                  rows={4}
                  className={
                    errors.teacherRequestReason ? 'border-red-500' : ''
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
