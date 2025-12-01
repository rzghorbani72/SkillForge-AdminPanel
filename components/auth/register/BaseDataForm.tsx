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
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';

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
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
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
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
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
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">{t('auth.createNewSchool')}</h3>
                <p className="text-sm text-gray-600">
                  {t('auth.createNewSchoolDescription')}
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
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium">{t('auth.joinExistingSchool')}</h3>
                <p className="text-sm text-gray-600">
                  {t('auth.joinExistingSchoolDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="space-y-2">
          <Label htmlFor="name">{t('auth.fullName')}</Label>
          <Input
            id="name"
            type="text"
            placeholder={t('auth.enterFullName')}
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
            disabled={isLoading}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <div className="relative">
              <Lock
                className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}
              />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.createPassword')}
                value={formData.password}
                onChange={(e) => onChange('password', e.target.value)}
                className={`${isRTL ? 'pe-10 pr-10' : 'pl-10 ps-10'} ${errors.password ? 'border-red-500' : ''}`}
                disabled={isLoading}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`absolute top-0 h-full px-3 py-2 hover:bg-transparent ${isRTL ? 'left-0' : 'right-0'}`}
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
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <div className="relative">
              <Lock
                className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}
              />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={(e) => onChange('confirmPassword', e.target.value)}
                className={`${isRTL ? 'pe-10 pr-10' : 'pl-10 ps-10'} ${errors.confirmPassword ? 'border-red-500' : ''}`}
                disabled={isLoading}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`absolute top-0 h-full px-3 py-2 hover:bg-transparent ${isRTL ? 'left-0' : 'right-0'}`}
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
        <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="space-y-2">
            <Label htmlFor="schoolName">{t('schools.schoolName')}</Label>
            <Input
              id="schoolName"
              type="text"
              placeholder={t('schools.enterSchoolName')}
              value={formData.schoolName}
              onChange={(e) => {
                onChange('schoolName', e.target.value);
                onGenerateSlug(e.target.value);
              }}
              className={errors.schoolName ? 'border-red-500' : ''}
              disabled={isLoading}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolSlug">{t('schools.schoolUrlSlug')}</Label>
            <div className="relative">
              <Input
                id="schoolSlug"
                type="text"
                placeholder={t('schools.schoolSlugPlaceholder')}
                value={formData.schoolSlug}
                onChange={(e) => onChange('schoolSlug', e.target.value)}
                className={`${isRTL ? 'pl-20 ps-20' : 'pe-20 pr-20'} ${errors.schoolSlug ? 'border-red-500' : ''}`}
                disabled={isLoading}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <span
                className={`absolute top-3 text-sm text-gray-500 ${isRTL ? 'left-3' : 'right-3'}`}
              >
                .skillforge.com
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolDescription">
              {t('schools.schoolDescription')} ({t('common.optional')})
            </Label>
            <Textarea
              id="schoolDescription"
              placeholder={t('schools.schoolDescriptionPlaceholder')}
              value={formData.schoolDescription}
              onChange={(e) => onChange('schoolDescription', e.target.value)}
              disabled={isLoading}
              rows={3}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="space-y-2">
            <Label htmlFor="existingSchool">{t('auth.selectSchool')}</Label>
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
                      ? t('common.loading')
                      : schoolsError
                        ? t('common.errorLoading')
                        : t('auth.chooseSchoolToJoin')
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
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="joinAsTeacher"
                checked={joinAsTeacher}
                onChange={(e) => setJoinAsTeacher(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label
                htmlFor="joinAsTeacher"
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span>{t('auth.requestTeacherRole')}</span>
              </Label>
            </div>
            {joinAsTeacher && (
              <div className="space-y-2">
                <Label htmlFor="teacherRequestReason">
                  {t('auth.whyWantToBeTeacher')}
                </Label>
                <Textarea
                  id="teacherRequestReason"
                  placeholder={t('auth.teacherRequestReasonPlaceholder')}
                  value={formData.teacherRequestReason}
                  onChange={(e) =>
                    onChange('teacherRequestReason', e.target.value)
                  }
                  disabled={isLoading}
                  rows={4}
                  className={
                    errors.teacherRequestReason ? 'border-red-500' : ''
                  }
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
