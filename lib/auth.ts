import { apiClient } from './api';
import { ErrorHandler } from './error-handler';
import { User, Profile, School } from '@/types/api';
import { isDevelopmentMode, getSchoolUrl, logDevInfo } from './dev-utils';

export interface AuthUser {
  user: User;
  access_token: string;
  currentProfile?: Profile;
  currentSchool?: School;
  requires_school_selection?: boolean;
  available_schools?: School[];
  availableProfiles?: Profile[];
  availableSchools?: School[];
  permissions?: string[];
  expires_at?: Date;
  isStaff?: boolean;
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

export interface LoginCredentials {
  identifier: string;
  password: string;
  school_id?: number;
}

export interface RegisterData {
  name: string;
  phone_number: string;
  email?: string;
  password: string;
  confirmed_password: string;
  role: string;
  school_id?: number;
  display_name: string;
  bio?: string;
  website?: string;
  location?: string;
  // School creation data (for MANAGER role)
  school_name?: string;
  school_slug?: string;
  school_description?: string;
  // Teacher request data
  teacher_request?: boolean;
  teacher_request_reason?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private authType: AuthType['type'] = 'admin';

  // Login with password
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await apiClient.login(credentials);
      console.log('login 2.', { response });
      if (response.data) {
        this.currentUser = response.data as AuthUser;
        return this.currentUser;
      }

      throw new Error('Login failed');
    } catch (error) {
      ErrorHandler.handleValidationErrors(error);
      throw error;
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthUser> {
    try {
      const response = await apiClient.register(userData);

      if (response.data) {
        this.currentUser = response.data as AuthUser;
        return this.currentUser;
      }

      throw new Error('Registration failed');
    } catch (error) {
      ErrorHandler.handleValidationErrors(error);
      throw error;
    }
  }

  // Login with phone OTP
  async loginPhoneByOtp(credentials: {
    phone_number: string;
    otp: string;
    school_id?: number;
  }): Promise<AuthUser> {
    try {
      const response = await apiClient.loginPhoneByOtp(credentials);

      if (response.data) {
        this.currentUser = response.data as AuthUser;
        return this.currentUser;
      }

      throw new Error('Phone OTP login failed');
    } catch (error) {
      ErrorHandler.handleValidationErrors(error);
      throw error;
    }
  }

  // Login with email OTP
  async loginEmailByOtp(credentials: {
    email: string;
    otp: string;
    school_id?: number;
  }): Promise<AuthUser> {
    try {
      const response = await apiClient.loginEmailByOtp(credentials);

      if (response.data) {
        this.currentUser = response.data as AuthUser;
        return this.currentUser;
      }

      throw new Error('Email OTP login failed');
    } catch (error) {
      ErrorHandler.handleValidationErrors(error);
      throw error;
    }
  }

  // Select school after login
  async selectSchool(data: {
    temp_token: string;
    school_id: number;
  }): Promise<AuthUser> {
    try {
      const response = await apiClient.selectSchool(data);

      if (response.data) {
        this.currentUser = response.data as AuthUser;
        return this.currentUser;
      }

      throw new Error('School selection failed');
    } catch (error) {
      ErrorHandler.handleValidationErrors(error);
      throw error;
    }
  }

  // Get current authenticated user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Get access token
  getAccessToken(): string | null {
    return this.currentUser?.access_token || null;
  }

  // Get current user profile
  getCurrentProfile(): Profile | null {
    return this.currentUser?.currentProfile || null;
  }

  // Set authentication type (public for students, admin for staff)
  setAuthType(type: AuthType['type']): void {
    this.authType = type;
  }

  // Get current authentication type
  getAuthType(): AuthType['type'] {
    return this.authType;
  }

  // Check if user can access admin panel
  canAccessAdminPanel(user: AuthUser): boolean {
    return user.isStaff || false;
  }

  // Check if user has permission
  hasPermission(user: AuthUser, permission: string): boolean {
    return user.permissions?.includes(permission) || false;
  }

  // Check if user can manage school
  canManageSchool(user: AuthUser): boolean {
    return this.hasPermission(user, 'manage_school');
  }

  // Check if user can manage users
  canManageUsers(user: AuthUser): boolean {
    return this.hasPermission(user, 'manage_users');
  }

  // Check if user can view analytics
  canViewAnalytics(user: AuthUser): boolean {
    return this.hasPermission(user, 'view_analytics');
  }

  // Check if user can enroll in courses
  canEnroll(user: AuthUser): boolean {
    return this.hasPermission(user, 'enroll_courses');
  }

  // Get user's role in current school
  getCurrentRole(user: AuthUser): string {
    return user.currentProfile?.role?.name || '';
  }

  // Get user's current school (overloaded method)
  getCurrentSchool(user?: AuthUser): School | null {
    if (user) {
      return user.currentSchool || null;
    }
    return this.currentUser?.currentSchool || null;
  }

  // Get available profiles for user
  getAvailableProfiles(user: AuthUser): Profile[] {
    return user.availableProfiles || [];
  }

  // Get available schools for user
  getAvailableSchools(user: AuthUser): School[] {
    return user.availableSchools || [];
  }

  // Get school dashboard URL
  getSchoolDashboardUrl(school: School): string {
    if (isDevelopmentMode()) {
      // In development, use localhost with school slug as subdomain
      const schoolUrl = getSchoolUrl(school.slug);
      logDevInfo('School URL for development:', schoolUrl);
      return schoolUrl;
    }

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
    const response = await apiClient.getUserProfiles();
    const profiles = response?.data || ([] as UserProfile[]);
    return profiles.some((profile: UserProfile) => profile.role === 'TEACHER');
  }

  // Check if user is a manager in any school
  async isManagerInAnySchool(): Promise<boolean> {
    const response = await apiClient.getUserProfiles();
    const profiles = response?.data || ([] as UserProfile[]);
    return profiles.some((profile: UserProfile) => profile.role === 'MANAGER');
  }

  // Check if user is an admin
  async isAdmin(): Promise<boolean> {
    const response = await apiClient.getUserProfiles();
    const profiles = response?.data || ([] as UserProfile[]);
    return profiles.some((profile: UserProfile) => profile.role === 'ADMIN');
  }

  // Get user's role in a specific school
  async getUserRoleInSchool(schoolId: number): Promise<string | null> {
    const response = await apiClient.getUserProfiles();
    const profiles = response?.data || ([] as UserProfile[]);
    const profile = profiles.find((p: UserProfile) => p.schoolId === schoolId);
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

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear cached data
      this.currentUser = null;

      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('current_profile');
      localStorage.removeItem('current_school');

      // Redirect to appropriate login page
      if (isDevelopmentMode()) {
        // In development, redirect to localhost login
        logDevInfo('Development mode: Redirecting to localhost login');
        window.location.href = '/login';
      } else {
        // In production, use the appropriate login path
        const loginPath =
          this.authType === 'public' ? '/student/login' : '/admin/login';
        window.location.href = loginPath;
      }
    }
  }

  // Clear cached data
  clearCache(): void {
    this.currentUser = null;
  }

  // Set current user (for manual session restoration)
  setCurrentUser(user: AuthUser): void {
    this.currentUser = user;
  }

  // Get user's schools
  async getUserSchools(): Promise<School[]> {
    try {
      const response = await apiClient.getUserSchools();
      return (response as School[]) || [];
    } catch (error) {
      console.error('Failed to fetch user schools:', error);
      return [];
    }
  }
}

export const authService = new AuthService();
