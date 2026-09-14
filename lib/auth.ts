import { apiClient } from './api';
import { ErrorHandler } from './error-handler';
import { User, Profile, Academy } from '@/types/api';
import { isDevelopmentMode, getStoreUrl, logDevInfo } from './dev-utils';
import { wipeNonPlatformStorage } from './wipe-non-platform-storage';

export interface AuthUser {
  user: User;
  access_token: string;
  currentProfile?: Profile;
  currentAcademy?: Academy;
  requires_academy_selection?: boolean;
  available_academies?: Academy[];
  availableProfiles?: Profile[];
  availableAcademies?: Academy[];
  permissions?: string[];
  expires_at?: Date;
  isStaff?: boolean;
}

export interface UserProfile {
  id: number;
  userId: number;
  academyId: string;
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
  academy_id?: string;
  captcha_token?: string;
}

export interface RegisterData {
  name: string;
  phone_number: string;
  email?: string;
  password: string;
  confirmed_password: string;
  role: string;
  academy_id?: string;
  display_name: string;
  bio?: string;
  website?: string;
  location?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private authType: AuthType['type'] = 'admin';

  /**
   * Session lives in HttpOnly cookies — never persist tokens or RBAC in
   * localStorage (readable from DevTools / XSS).
   * Every login starts from clean client storage: a stale academy cache,
   * selected academy or per-tab rescope flag from an earlier session would
   * otherwise scope the new token's requests to the wrong academy.
   */
  private persistSession(user: AuthUser | null) {
    if (typeof window === 'undefined') return;
    wipeNonPlatformStorage();
    if (!user) return;
    // Drop a leftover 401/legal pause from the login-page session probe.
    apiClient.resumeRequests();

    const academyId =
      user.currentProfile?.academy_id ??
      (user.currentProfile as { Academy?: { id?: number } })?.Academy?.id ??
      user.currentAcademy?.id ??
      null;
    if (academyId) {
      window.localStorage.setItem(
        'skillforge_selected_academy_id',
        String(academyId)
      );
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
      throw error;
    }
  }

  // Admin login with email + phone + password
  async adminLogin(credentials: {
    email: string;
    phone_number: string;
    password: string;
  }): Promise<AuthUser> {
    try {
      const response = await apiClient.adminLogin(credentials);
      if (response?.data) {
        this.currentUser = response.data as AuthUser;
        this.persistSession(this.currentUser);
        return this.currentUser;
      }

      throw new Error('Admin login failed');
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
    academy_id?: string;
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
    academy_id?: string;
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

  async selectAcademy(data: {
    temp_token: string;
    academy_id: string;
  }): Promise<AuthUser> {
    try {
      const response = await apiClient.selectAcademy(data);

      if (response?.data) {
        this.currentUser = response.data as AuthUser;
        this.persistSession(this.currentUser);
        return this.currentUser;
      }

      throw new Error('Academy selection failed');
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
    return (
      user.currentProfile?.Role?.name || user.currentProfile?.role?.name || ''
    );
  }

  getCurrentAcademy(user?: AuthUser): Academy | null {
    if (user) {
      return user.currentAcademy || null;
    }
    return this.currentUser?.currentAcademy || null;
  }

  // Get available profiles for user
  getAvailableProfiles(user: AuthUser): Profile[] {
    return user.availableProfiles || [];
  }

  getAvailableAcademies(user: AuthUser): Academy[] {
    return user.availableAcademies || user.available_academies || [];
  }

  getAcademyDashboardUrl(academy: Academy): string {
    if (isDevelopmentMode()) {
      const storeUrl = getStoreUrl(academy.slug);
      logDevInfo('Academy URL for development:', storeUrl);
      return storeUrl;
    }

    if (academy.domain?.public_address) {
      return `https://${academy.domain.public_address}`;
    }

    const privateDomain = academy.slug;
    return `https://${privateDomain}.skillforge.com`;
  }

  getAcademyLoginUrl(academy: Academy): string {
    const baseUrl = this.getAcademyDashboardUrl(academy);
    return `${baseUrl}/login`;
  }

  // Check if user is a teacher in any store
  async isTeacherInAnyStore(): Promise<boolean> {
    const response = await apiClient.getUserProfiles();
    const raw = response?.data as unknown;
    const profiles = Array.isArray(raw)
      ? raw
      : raw &&
          typeof raw === 'object' &&
          Array.isArray((raw as { data?: unknown[] }).data)
        ? (raw as { data: UserProfile[] }).data
        : ([] as UserProfile[]);
    return profiles.some((profile: UserProfile) => profile.role === 'TEACHER');
  }

  // Check if user is a manager in any store
  async isManagerInAnyStore(): Promise<boolean> {
    const response = await apiClient.getUserProfiles();
    const raw = response?.data as unknown;
    const profiles = Array.isArray(raw)
      ? raw
      : raw &&
          typeof raw === 'object' &&
          Array.isArray((raw as { data?: unknown[] }).data)
        ? (raw as { data: UserProfile[] }).data
        : ([] as UserProfile[]);
    return profiles.some((profile: UserProfile) => profile.role === 'MANAGER');
  }

  // Check if user is an admin
  async isAdmin(): Promise<boolean> {
    const response = await apiClient.getUserProfiles();
    const raw = response?.data as unknown;
    const profiles = Array.isArray(raw)
      ? raw
      : raw &&
          typeof raw === 'object' &&
          Array.isArray((raw as { data?: unknown[] }).data)
        ? (raw as { data: UserProfile[] }).data
        : ([] as UserProfile[]);
    return profiles.some((profile: UserProfile) => profile.role === 'ADMIN');
  }

  // Get user's role in a specific store
  async getUserRoleInStore(academyId: string): Promise<string | null> {
    const response = await apiClient.getUserProfiles();
    const raw = response?.data as unknown;
    const profiles = Array.isArray(raw)
      ? raw
      : raw &&
          typeof raw === 'object' &&
          Array.isArray((raw as { data?: unknown[] }).data)
        ? (raw as { data: UserProfile[] }).data
        : ([] as UserProfile[]);
    const profile = profiles.find(
      (p: UserProfile) => p.academyId === academyId
    );
    return profile?.role || null;
  }

  // Check if user can manage a specific store
  async canManageStoreById(academyId: string): Promise<boolean> {
    const role = await this.getUserRoleInStore(academyId);
    return role === 'ADMIN' || role === 'MANAGER' || role === 'TEACHER';
  }

  // Check if user can access admin features in a store
  async canAccessStoreAdmin(academyId: string): Promise<boolean> {
    const role = await this.getUserRoleInStore(academyId);
    return role === 'ADMIN' || role === 'MANAGER';
  }

  // Logout user - single canonical path (see lib/sign-out.ts)
  async logout(): Promise<void> {
    this.currentUser = null;
    const { signOut } = await import('./sign-out');
    await signOut();
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
  async getUserAcademies(): Promise<Academy[]> {
    try {
      const response = await apiClient.getUserAcademies();
      const raw = response as { data?: Academy[] } | Academy[] | null;
      const list = Array.isArray(raw) ? raw : raw?.data;
      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error('Failed to fetch user stores:', error);
      return [];
    }
  }
}

export const authService = new AuthService();
