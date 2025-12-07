'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';

interface Profile {
  id: number;
  display_name: string;
  store: {
    id: number;
    name: string;
    slug: string;
  };
  role: string;
  has_password: boolean;
}

interface ChangePasswordForm {
  profile_id: number;
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export function ProfilePasswordManager() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState<number | null>(null);
  const [formData, setFormData] = useState<ChangePasswordForm>({
    profile_id: 0,
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [errors, setErrors] = useState<Partial<ChangePasswordForm>>({});
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserProfiles();
      if (response.data?.profiles) {
        setProfiles(response.data.profiles);
      }
    } catch (error) {
      ErrorHandler.handleValidationErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ChangePasswordForm> = {};

    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'New password must be at least 6 characters';
    }

    if (!formData.confirm_new_password) {
      newErrors.confirm_new_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_new_password) {
      newErrors.confirm_new_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async (profileId: number) => {
    if (!validateForm()) {
      return;
    }

    try {
      setChangingPassword(profileId);
      setMessage(null);

      const response = await apiClient.changeProfilePassword({
        profile_id: profileId,
        current_password: formData.current_password,
        new_password: formData.new_password,
        confirm_new_password: formData.confirm_new_password
      });

      if (response.data?.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setFormData({
          profile_id: 0,
          current_password: '',
          new_password: '',
          confirm_new_password: ''
        });
        setErrors({});
      }
    } catch (error) {
      ErrorHandler.handleValidationErrors(error);
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setChangingPassword(null);
    }
  };

  const startPasswordChange = (profile: Profile) => {
    setFormData({
      profile_id: profile.id,
      current_password: '',
      new_password: '',
      confirm_new_password: ''
    });
    setErrors({});
    setMessage(null);
  };

  const cancelPasswordChange = () => {
    setFormData({
      profile_id: 0,
      current_password: '',
      new_password: '',
      confirm_new_password: ''
    });
    setErrors({});
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile Password Management</h2>
        <p className="text-gray-600">
          Manage passwords for your different store profiles. Each profile can
          have its own password.
        </p>
      </div>

      {message && (
        <Alert
          className={
            message.type === 'success'
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }
        >
          <AlertDescription
            className={
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {profile.display_name}
                  </CardTitle>
                  <CardDescription>
                    {profile.store.name} • {profile.role}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      profile.has_password
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {profile.has_password ? 'Password Set' : 'No Password'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startPasswordChange(profile)}
                    disabled={changingPassword === profile.id}
                  >
                    {changingPassword === profile.id
                      ? 'Changing...'
                      : 'Change Password'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {formData.profile_id === profile.id && (
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor={`current_password_${profile.id}`}>
                      Current Password
                    </Label>
                    <Input
                      id={`current_password_${profile.id}`}
                      type="password"
                      value={formData.current_password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          current_password: e.target.value
                        })
                      }
                      className={
                        errors.current_password ? 'border-red-500' : ''
                      }
                    />
                    {errors.current_password && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.current_password}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`new_password_${profile.id}`}>
                      New Password
                    </Label>
                    <Input
                      id={`new_password_${profile.id}`}
                      type="password"
                      value={formData.new_password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          new_password: e.target.value
                        })
                      }
                      className={errors.new_password ? 'border-red-500' : ''}
                    />
                    {errors.new_password && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.new_password}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`confirm_password_${profile.id}`}>
                      Confirm New Password
                    </Label>
                    <Input
                      id={`confirm_password_${profile.id}`}
                      type="password"
                      value={formData.confirm_new_password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirm_new_password: e.target.value
                        })
                      }
                      className={
                        errors.confirm_new_password ? 'border-red-500' : ''
                      }
                    />
                    {errors.confirm_new_password && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.confirm_new_password}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleChangePassword(profile.id)}
                      disabled={changingPassword === profile.id}
                    >
                      {changingPassword === profile.id
                        ? 'Changing...'
                        : 'Update Password'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelPasswordChange}
                      disabled={changingPassword === profile.id}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {profiles.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No profiles found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
