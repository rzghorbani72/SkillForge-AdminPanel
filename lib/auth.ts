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

const normalizePermissionArray = (permissions: unknown): string[] => {
  if (!permissions) return [];
  if (!Array.isArray(permissions)) return [];

  return permissions
    .map((permission) => {
      if (!permission) return null;
      if (typeof permission === 'string') return permission;
      if (typeof permission === 'object') {
        if (
          'name' in permission &&
          typeof (permission as any).name === 'string'
        ) {
          return (permission as any).name as string;
        }
        if (
          'permission' in permission &&
          typeof (permission as any).permission === 'string'
        ) {
          return (permission as any).permission as string;
        }
      }
      return null;
    })
    .filter((permission): permission is string => Boolean(permission));
};

class AuthService {
  private currentUser: AuthUser | null = null;
  private authType: AuthType['type'] = 'admin';

  private persistSession(user: AuthUser | null) {
    if (typeof window === 'undefined') return;

    try {
      if (!user) {
        window.localStorage.removeItem('auth_token');
        window.localStorage.removeItem('user_data');
        window.localStorage.removeItem('current_profile');
        window.localStorage.removeItem('current_school');
        window.localStorage.removeItem('user_permissions');
        window.localStorage.removeItem('auth_user');
        return;
      }

      const derivedPermissions =
        user.permissions && user.permissions.length > 0
          ? normalizePermissionArray(user.permissions)
          : normalizePermissionArray(
              (user.currentProfile as any)?.permissions ||
                (user.currentProfile?.role as any)?.permissions ||
                []
            );

      if (user.access_token) {
        window.localStorage.setItem('auth_token', user.access_token);
      } else {
        window.localStorage.removeItem('auth_token');
      }

      if (user.user) {
        window.localStorage.setItem('user_data', JSON.stringify(user.user));
      } else {
        window.localStorage.removeItem('user_data');
      }

      if (user.currentProfile) {
        window.localStorage.setItem(
          'current_profile',
          JSON.stringify(user.currentProfile)
        );
      } else {
        window.localStorage.removeItem('current_profile');
      }

      if (user.currentSchool) {
        window.localStorage.setItem(
          'current_school',
          JSON.stringify(user.currentSchool)
        );
      } else {
        window.localStorage.removeItem('current_school');
      }

      window.localStorage.setItem(
        'user_permissions',
        JSON.stringify(derivedPermissions)
      );
      window.localStorage.setItem('auth_user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to persist auth session', error);
    }
  }

  // Login with password
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await apiClient.login(credentials);
      if (response.data) {
        this.currentUser = response.data as AuthUser;
        this.persistSession(this.currentUser);
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
        this.persistSession(this.currentUser);
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
        this.persistSession(this.currentUser);
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
        this.persistSession(this.currentUser);
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
        this.persistSession(this.currentUser);
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

  // Logout user - uses server action to remove cookie
  async logout(): Promise<void> {
    try {
      // Import server action dynamically to avoid SSR issues
      const { logout: logoutAction } = await import('@/app/actions/auth');
      const result = await logoutAction();

      if (result.success) {
        // Clear cached data
        this.currentUser = null;
        this.persistSession(null);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('user_state');
          // Redirect to appropriate login page
          if (isDevelopmentMode()) {
            logDevInfo('Development mode: Redirecting to localhost login');
            window.location.href = '/login';
          } else {
            const loginPath =
              this.authType === 'public' ? '/student/login' : '/admin/login';
            window.location.href = loginPath;
          }
        }
      } else {
        throw new Error(result.error || 'Logout failed');
      }
    } catch (error) {
      console.warn('Logout failed:', error);
      // Fallback: clear cached data and redirect
      this.currentUser = null;
      this.persistSession(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('user_state');
        if (isDevelopmentMode()) {
          window.location.href = '/login';
        } else {
          const loginPath =
            this.authType === 'public' ? '/student/login' : '/admin/login';
          window.location.href = loginPath;
        }
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
    this.persistSession(user);
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
