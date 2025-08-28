import { apiClient } from './api';
import { User, Profile, School } from '@/types/api';
import { ErrorHandler } from './error-handler';

export interface EnhancedAuthUser {
  user: User;
  currentProfile: Profile;
  currentSchool: School;
  availableProfiles: Profile[];
  availableSchools: School[];
  permissions: string[];
  isStaff: boolean;
  isStudent: boolean;
}

export interface UserProfile {
  id: number;
  userId: number;
  schoolId: number;
  role: string;
  displayName: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
}

export interface AuthType {
  type: 'public' | 'admin';
}

class EnhancedAuthService {
  private currentUser: EnhancedAuthUser | null = null;
  private authType: AuthType['type'] = 'admin';

  // Set authentication type (public for students, admin for staff)
  setAuthType(type: AuthType['type']): void {
    this.authType = type;
  }

  // Get current authentication type
  getAuthType(): AuthType['type'] {
    return this.authType;
  }

  // Enhanced login with auth type
  async enhancedLogin(credentials: {
    phone_number: string;
    password?: string;
    otp?: string;
    school_id?: number;
    profile_id?: number;
  }): Promise<EnhancedAuthUser> {
    try {
      const response = await apiClient.enhancedLogin(credentials);

      if (response.data) {
        // Clear cached data
        this.currentUser = null;

        // Store the enhanced user data
        this.currentUser = response.data as EnhancedAuthUser;

        return this.currentUser;
      }

      throw new Error('Login failed');
    } catch (error) {
      ErrorHandler.handleValidationErrors(error);
      throw error;
    }
  }

  // Enhanced register with auth type
  async enhancedRegister(userData: {
    name: string;
    phone_number: string;
    email?: string;
    password: string;
    confirmed_password: string;
    phone_otp: string;
    email_otp?: string;
    role: string;
    school_id: number;
    display_name: string;
    bio?: string;
    website?: string;
    location?: string;
  }): Promise<EnhancedAuthUser> {
    try {
      const response = await apiClient.enhancedRegister(userData);

      if (response.data) {
        // Clear cached data
        this.currentUser = null;

        // Store the enhanced user data
        this.currentUser = response.data as EnhancedAuthUser;

        return this.currentUser;
      }

      throw new Error('Registration failed');
    } catch (error) {
      ErrorHandler.handleValidationErrors(error);
      throw error;
    }
  }

  // Switch user profile (school context)
  async switchProfile(
    profileId: number,
    schoolId: number
  ): Promise<EnhancedAuthUser> {
    try {
      const response = await apiClient.switchProfile(profileId, schoolId);

      if (response.data) {
        // Update current user data
        this.currentUser = response.data as EnhancedAuthUser;
        return this.currentUser;
      }

      throw new Error('Profile switch failed');
    } catch (error) {
      ErrorHandler.handleValidationErrors(error);
      throw error;
    }
  }

  // Get user profiles
  async getUserProfiles(): Promise<UserProfile[]> {
    try {
      const response = await apiClient.getUserProfiles();
      return (response.data as any)?.profiles || [];
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  // Get user schools
  async getUserSchools(): Promise<School[]> {
    try {
      const response = await apiClient.getUserSchools();
      return (response.data as any)?.schools || [];
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  // Create new profile
  async createProfile(profileData: {
    school_id: number;
    role: string;
    display_name: string;
    bio?: string;
    website?: string;
    location?: string;
  }): Promise<EnhancedAuthUser> {
    try {
      const response = await apiClient.createProfile(profileData);

      if (response.data) {
        // Update current user data
        this.currentUser = response.data as EnhancedAuthUser;
        return this.currentUser;
      }

      throw new Error('Profile creation failed');
    } catch (error) {
      ErrorHandler.handleValidationErrors(error);
      throw error;
    }
  }

  // Get user context
  async getUserContext(): Promise<any> {
    try {
      const response = await apiClient.getUserContext();
      return (response.data as any)?.context;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  // Validate role registration
  async validateRoleRegistration(
    schoolId: number,
    role: string
  ): Promise<boolean> {
    try {
      const response = await apiClient.validateRoleRegistration(schoolId, role);
      return (response.data as any)?.valid || false;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  // Get primary school
  async getPrimarySchool(): Promise<School | null> {
    try {
      const response = await apiClient.getPrimarySchool();
      return (response.data as any)?.school || null;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  // Send OTP for phone verification
  async sendPhoneOtp(phone_number: string): Promise<{ otp: string }> {
    try {
      const response = await apiClient.sendPhoneOtp(phone_number);
      return response.data as { otp: string };
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  // Send OTP for email verification
  async sendEmailOtp(email: string): Promise<{ otp: string }> {
    try {
      const response = await apiClient.sendEmailOtp(email);
      return response.data as { otp: string };
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  // Verify phone OTP
  async verifyPhoneOtp(phone_number: string, otp: string): Promise<boolean> {
    try {
      const response = await apiClient.verifyPhoneOtp(phone_number, otp);
      return (response.data as any)?.valid || false;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  // Verify email OTP
  async verifyEmailOtp(email: string, otp: string): Promise<boolean> {
    try {
      const response = await apiClient.verifyEmailOtp(email, otp);
      return (response.data as any)?.valid || false;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<EnhancedAuthUser | null> {
    try {
      if (this.currentUser) {
        return this.currentUser;
      }

      // Try to get user context from API
      const context = await this.getUserContext();
      if (context) {
        // Reconstruct the user object from context
        this.currentUser = {
          user: context.user,
          currentProfile: context.currentProfile,
          currentSchool: context.currentSchool,
          availableProfiles: context.availableProfiles,
          availableSchools: context.availableSchools,
          permissions: context.permissions,
          isStaff: context.isStaff,
          isStudent: context.isStudent
        };
        return this.currentUser;
      }

      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Check if user can access admin panel
  canAccessAdminPanel(user: EnhancedAuthUser): boolean {
    return user.isStaff;
  }

  // Check if user should be redirected to school (students)
  shouldRedirectToSchool(user: EnhancedAuthUser): boolean {
    return user.isStudent;
  }

  // Check if user has permission
  hasPermission(user: EnhancedAuthUser, permission: string): boolean {
    return user.permissions.includes(permission);
  }

  // Check if user can manage school
  canManageSchool(user: EnhancedAuthUser): boolean {
    return this.hasPermission(user, 'manage_school');
  }

  // Check if user can manage users
  canManageUsers(user: EnhancedAuthUser): boolean {
    return this.hasPermission(user, 'manage_users');
  }

  // Check if user can view analytics
  canViewAnalytics(user: EnhancedAuthUser): boolean {
    return this.hasPermission(user, 'view_analytics');
  }

  // Check if user can enroll in courses
  canEnroll(user: EnhancedAuthUser): boolean {
    return this.hasPermission(user, 'enroll_courses');
  }

  // Get user's role in current school
  getCurrentRole(user: EnhancedAuthUser): string {
    return user.currentProfile.role?.name || '';
  }

  // Get user's current school
  getCurrentSchool(user: EnhancedAuthUser): School {
    return user.currentSchool;
  }

  // Get available profiles for user
  getAvailableProfiles(user: EnhancedAuthUser): Profile[] {
    return user.availableProfiles;
  }

  // Get available schools for user
  getAvailableSchools(user: EnhancedAuthUser): School[] {
    return user.availableSchools;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear cached data
      this.currentUser = null;

      // Redirect to appropriate login page
      const loginPath =
        this.authType === 'public' ? '/student/login' : '/admin/login';
      window.location.href = loginPath;
    }
  }

  // Clear cached data
  clearCache(): void {
    this.currentUser = null;
  }

  // Get school dashboard URL
  getSchoolDashboardUrl(school: School): string {
    // If school has a public domain, use it
    if (school.domain?.public_address) {
      return `https://${school.domain.public_address}`;
    }

    // Otherwise, use the private domain with the main domain
    const privateDomain = school.slug;
    return `https://${privateDomain}.skillforge.com`;
  }

  // Get school login URL
  getSchoolLoginUrl(school: School): string {
    const baseUrl = this.getSchoolDashboardUrl(school);
    return `${baseUrl}/login`;
  }

  // Check if user is a teacher in any school
  async isTeacherInAnySchool(): Promise<boolean> {
    const profiles = await this.getUserProfiles();
    return profiles.some((profile) => profile.role === 'TEACHER');
  }

  // Check if user is a manager in any school
  async isManagerInAnySchool(): Promise<boolean> {
    const profiles = await this.getUserProfiles();
    return profiles.some((profile) => profile.role === 'MANAGER');
  }

  // Check if user is an admin
  async isAdmin(): Promise<boolean> {
    const profiles = await this.getUserProfiles();
    return profiles.some((profile) => profile.role === 'ADMIN');
  }

  // Get user's role in a specific school
  async getUserRoleInSchool(schoolId: number): Promise<string | null> {
    const profiles = await this.getUserProfiles();
    const profile = profiles.find((p) => p.schoolId === schoolId);
    return profile?.role || null;
  }

  // Check if user can manage a specific school
  async canManageSchoolById(schoolId: number): Promise<boolean> {
    const role = await this.getUserRoleInSchool(schoolId);
    return role === 'ADMIN' || role === 'MANAGER' || role === 'TEACHER';
  }

  // Check if user can access admin features in a school
  async canAccessSchoolAdmin(schoolId: number): Promise<boolean> {
    const role = await this.getUserRoleInSchool(schoolId);
    return role === 'ADMIN' || role === 'MANAGER';
  }
}

export const enhancedAuthService = new EnhancedAuthService();
