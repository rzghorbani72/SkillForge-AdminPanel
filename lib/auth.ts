import { apiClient } from './api';
import { ErrorHandler } from './error-handler';

export interface AuthUser {
  user: any;
  access_token: string;
  currentProfile?: any;
  currentSchool?: any;
  requires_school_selection?: boolean;
  available_schools?: any[];
  availableProfiles?: any[];
  availableSchools?: any[];
  permissions?: string[];
  expires_at?: Date;
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

  // Login with password
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await apiClient.login(credentials);

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

  // Send phone OTP
  async sendPhoneOtp(phone_number: string): Promise<{ otp: string }> {
    try {
      const response = await apiClient.sendPhoneOtp(phone_number);
      return response.data as { otp: string };
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  }

  // Send email OTP
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
  getCurrentProfile(): any | null {
    return this.currentUser?.currentProfile || null;
  }

  // Get current school
  getCurrentSchool(): any | null {
    return this.currentUser?.currentSchool || null;
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

      // Redirect to login page
      window.location.href = '/login';
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
}

export const authService = new AuthService();
