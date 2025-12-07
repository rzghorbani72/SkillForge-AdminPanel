import { apiClient } from './api';
import { ErrorHandler } from './error-handler';
import { User, Profile, Store } from '@/types/api';
import { isDevelopmentMode, getStoreUrl, logDevInfo } from './dev-utils';

export interface AuthUser {
  user: User;
  access_token: string;
  currentProfile?: Profile;
  currentStore?: Store;
  requires_store_selection?: boolean;
  available_stores?: Store[];
  availableProfiles?: Profile[];
  availableStores?: Store[];
  permissions?: string[];
  expires_at?: Date;
  isStaff?: boolean;
}

export interface UserProfile {
  id: number;
  userId: number;
  storeId: number;
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
  store_id?: number;
}

export interface RegisterData {
  name: string;
  phone_number: string;
  email?: string;
  password: string;
  confirmed_password: string;
  role: string;
  store_id?: number;
  display_name: string;
  bio?: string;
  website?: string;
  location?: string;
  // Store creation data (for MANAGER role)
  store_name?: string;
  store_slug?: string;
  store_description?: string;
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

  /**
   * Persist session data - SECURITY NOTE:
   * - Access tokens are NO LONGER stored in localStorage (XSS vulnerability)
   * - JWT is stored in HttpOnly cookie by the backend
   * - Only non-sensitive user info is stored for UI purposes
   */
  private persistSession(user: AuthUser | null) {
    if (typeof window === 'undefined') return;

    try {
      if (!user) {
        // Clear all stored data on logout
        window.localStorage.removeItem('user_data');
        window.localStorage.removeItem('current_profile');
        window.localStorage.removeItem('current_school');
        window.localStorage.removeItem('user_permissions');
        window.localStorage.removeItem('auth_user');
        // Also remove legacy token storage keys if they exist
        window.localStorage.removeItem('auth_token');
        window.localStorage.removeItem('jwt');
        window.localStorage.removeItem('token');
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

      // SECURITY: DO NOT store access_token in localStorage
      // The JWT is securely stored in an HttpOnly cookie by the backend
      // We only store non-sensitive user data for UI purposes

      if (user.user) {
        // Store minimal user info (no sensitive data)
        const safeUserData = {
          id: user.user.id,
          name: user.user.name,
          email: user.user.email
            ? user.user.email.substring(0, 3) + '***'
            : null, // Mask email
          role: user.user.role
        };
        window.localStorage.setItem('user_data', JSON.stringify(safeUserData));
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

      if (user.currentStore) {
        window.localStorage.setItem(
          'current_store',
          JSON.stringify(user.currentStore)
        );
      } else {
        window.localStorage.removeItem('current_store');
      }

      window.localStorage.setItem(
        'user_permissions',
        JSON.stringify(derivedPermissions)
      );

      // Store auth user data without access_token
      const safeAuthUser = {
        ...user,
        access_token: undefined // Remove token from stored data
      };
      window.localStorage.setItem('auth_user', JSON.stringify(safeAuthUser));
    } catch (error) {
      console.error('Failed to persist auth session', error);
    }
  }

  // Login with password
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await apiClient.login(credentials);
      if (response?.data) {
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

      if (response?.data) {
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
    store_id?: number;
  }): Promise<AuthUser> {
    try {
      const response = await apiClient.loginPhoneByOtp(credentials);

      if (response?.data) {
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
    store_id?: number;
  }): Promise<AuthUser> {
    try {
      const response = await apiClient.loginEmailByOtp(credentials);

      if (response?.data) {
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

  // Select store after login
  async selectStore(data: {
    temp_token: string;
    store_id: number;
  }): Promise<AuthUser> {
    try {
      const response = await apiClient.selectStore(data);

      if (response?.data) {
        this.currentUser = response.data as AuthUser;
        this.persistSession(this.currentUser);
        return this.currentUser;
      }

      throw new Error('Store selection failed');
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

  // Check if user can manage store
  canManageStore(user: AuthUser): boolean {
    return this.hasPermission(user, 'manage_store');
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

  // Get user's role in current store
  getCurrentRole(user: AuthUser): string {
    return user.currentProfile?.role?.name || '';
  }

  // Get user's current store (overloaded method)
  getCurrentStore(user?: AuthUser): Store | null {
    if (user) {
      return user.currentStore || null;
    }
    return this.currentUser?.currentStore || null;
  }

  // Get available profiles for user
  getAvailableProfiles(user: AuthUser): Profile[] {
    return user.availableProfiles || [];
  }

  // Get available stores for user
  getAvailableStores(user: AuthUser): Store[] {
    return user.availableStores || [];
  }

  // Get store dashboard URL
  getStoreDashboardUrl(store: Store): string {
    if (isDevelopmentMode()) {
      // In development, use localhost with store slug as subdomain
      const storeUrl = getStoreUrl(store.slug);
      logDevInfo('Store URL for development:', storeUrl);
      return storeUrl;
    }

    // If store has a public domain, use it
    if (store.domain?.public_address) {
      return `https://${store.domain.public_address}`;
    }

    // Otherwise, use the private domain with the main domain
    const privateDomain = store.slug;
    return `https://${privateDomain}.skillforge.com`;
  }

  // Get store login URL
  getStoreLoginUrl(store: Store): string {
    const baseUrl = this.getStoreDashboardUrl(store);
    return `${baseUrl}/login`;
  }

  // Check if user is a teacher in any store
  async isTeacherInAnyStore(): Promise<boolean> {
    const response = await apiClient.getUserProfiles();
    const profiles = response?.data || ([] as UserProfile[]);
    return profiles.some((profile: UserProfile) => profile.role === 'TEACHER');
  }

  // Check if user is a manager in any store
  async isManagerInAnyStore(): Promise<boolean> {
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

  // Get user's role in a specific store
  async getUserRoleInStore(storeId: number): Promise<string | null> {
    const response = await apiClient.getUserProfiles();
    const profiles = response?.data || ([] as UserProfile[]);
    const profile = profiles.find((p: UserProfile) => p.storeId === storeId);
    return profile?.role || null;
  }

  // Check if user can manage a specific store
  async canManageStoreById(storeId: number): Promise<boolean> {
    const role = await this.getUserRoleInStore(storeId);
    return role === 'ADMIN' || role === 'MANAGER' || role === 'TEACHER';
  }

  // Check if user can access admin features in a store
  async canAccessStoreAdmin(storeId: number): Promise<boolean> {
    const role = await this.getUserRoleInStore(storeId);
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

  // Get user's stores
  async getUserStores(): Promise<Store[]> {
    try {
      const response = await apiClient.getUserStores();
      return (response as Store[]) || [];
    } catch (error) {
      console.error('Failed to fetch user stores:', error);
      return [];
    }
  }
}

export const authService = new AuthService();
