import { apiClient } from './api';
import { User, Profile, School } from '@/types/api';

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
    password: string;
    school_id?: number;
    profile_id?: number;
  }): Promise<EnhancedAuthUser> {
    const endpoint =
      this.authType === 'public'
        ? 'enhanced-auth/public/login'
        : 'enhanced-auth/admin/login';

    const response = await apiClient.post(endpoint, credentials);

    if (response.data) {
      // Clear cached data
      this.currentUser = null;

      // Store the enhanced user data
      this.currentUser = response.data as EnhancedAuthUser;

      return this.currentUser;
    }

    throw new Error('Login failed');
  }

  // Enhanced register with auth type
  async enhancedRegister(userData: {
    name: string;
    phone_number: string;
    email?: string;
    password: string;
    confirmed_password: string;
    otp: string;
    role: string;
    school_id: number;
    display_name: string;
    bio?: string;
    website?: string;
    location?: string;
  }): Promise<EnhancedAuthUser> {
    const endpoint =
      this.authType === 'public'
        ? 'enhanced-auth/public/register'
        : 'enhanced-auth/admin/register';

    const response = await apiClient.post(endpoint, userData);

    if (response.data) {
      // Clear cached data
      this.currentUser = null;

      // Store the enhanced user data
      this.currentUser = response.data as EnhancedAuthUser;

      return this.currentUser;
    }

    throw new Error('Registration failed');
  }

  // Switch user profile (school context)
  async switchProfile(
    profileId: number,
    schoolId: number
  ): Promise<EnhancedAuthUser> {
    const response = await apiClient.post('enhanced-auth/switch-profile', {
      profile_id: profileId,
      school_id: schoolId
    });

    if (response.data) {
      // Update current user data
      this.currentUser = response.data as EnhancedAuthUser;
      return this.currentUser;
    }

    throw new Error('Profile switch failed');
  }

  // Get user profiles
  async getUserProfiles(): Promise<UserProfile[]> {
    const response = await apiClient.get('enhanced-auth/profiles');
    return response.data?.profiles || [];
  }

  // Get user schools
  async getUserSchools(): Promise<School[]> {
    const response = await apiClient.get('enhanced-auth/schools');
    return response.data?.schools || [];
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
    const response = await apiClient.post(
      'enhanced-auth/create-profile',
      profileData
    );

    if (response.data) {
      // Update current user data
      this.currentUser = response.data as EnhancedAuthUser;
      return this.currentUser;
    }

    throw new Error('Profile creation failed');
  }

  // Get user context
  async getUserContext(): Promise<any> {
    const response = await apiClient.get('enhanced-auth/context');
    return response.data?.context;
  }

  // Validate role registration
  async validateRoleRegistration(
    schoolId: number,
    role: string
  ): Promise<boolean> {
    const response = await apiClient.post(
      `enhanced-auth/validate-role/${schoolId}/${role}`
    );
    return response.data?.valid || false;
  }

  // Get primary school
  async getPrimarySchool(): Promise<School | null> {
    const response = await apiClient.get('enhanced-auth/primary-school');
    return response.data?.school || null;
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
    return user.currentProfile.role;
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
