import { apiClient } from './api';
import { User, Profile, School } from '@/types/api';

export interface AuthUser {
  user: User;
  profile: Profile;
  school?: School;
}

export interface UserSchool {
  profile: Profile;
  school: School;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private userSchools: UserSchool[] = [];

  // Check if user can access the main admin panel
  canAccessAdminPanel(user: AuthUser): boolean {
    const role = user.profile.role?.name;
    return role === 'ADMIN' || role === 'MANAGER' || role === 'TEACHER';
  }

  // Check if user should be redirected to school (students)
  shouldRedirectToSchool(user: AuthUser): boolean {
    const role = user.profile.role?.name;
    return role === 'USER';
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (this.currentUser) {
        return this.currentUser;
      }

      // Get current profile from API
      const profileResponse = await apiClient.getCurrentProfile();
      const profile = profileResponse.data;

      if (!profile) {
        return null;
      }

      // Get user details
      const userResponse = await apiClient.getUser(profile.user_id);
      const user = userResponse.data;

      // Get school details if available
      let school: School | undefined;
      if (profile.school_id) {
        try {
          const schoolResponse = await apiClient.getCurrentSchool();
          school = schoolResponse.data;
        } catch (error) {
          console.warn('Could not fetch school details:', error);
        }
      }

      this.currentUser = {
        user,
        profile,
        school
      };

      return this.currentUser;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Get all schools where user has a profile
  async getUserSchools(): Promise<UserSchool[]> {
    try {
      if (this.userSchools.length > 0) {
        return this.userSchools;
      }

      // Get all schools where user has profiles
      const schoolsResponse = await apiClient.getSchools();
      const schools = schoolsResponse.data || [];

      // Get user profiles for each school
      const userSchools: UserSchool[] = [];
      
      for (const school of schools) {
        try {
          // This would need a backend endpoint to get user's profile in a specific school
          // For now, we'll use the current profile if it matches the school
          const currentUser = await this.getCurrentUser();
          if (currentUser && currentUser.profile.school_id === school.id) {
            userSchools.push({
              profile: currentUser.profile,
              school
            });
          }
        } catch (error) {
          console.warn(`Could not get profile for school ${school.id}:`, error);
        }
      }

      this.userSchools = userSchools;
      return userSchools;
    } catch (error) {
      console.error('Failed to get user schools:', error);
      return [];
    }
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
    const userSchools = await this.getUserSchools();
    return userSchools.some(us => us.profile.role?.name === 'TEACHER');
  }

  // Check if user is a manager in any school
  async isManagerInAnySchool(): Promise<boolean> {
    const userSchools = await this.getUserSchools();
    return userSchools.some(us => us.profile.role?.name === 'MANAGER');
  }

  // Check if user is an admin
  async isAdmin(): Promise<boolean> {
    const userSchools = await this.getUserSchools();
    return userSchools.some(us => us.profile.role?.name === 'ADMIN');
  }

  // Get primary school for user (where they have highest role)
  async getPrimarySchool(): Promise<UserSchool | null> {
    const userSchools = await this.getUserSchools();
    
    if (userSchools.length === 0) {
      return null;
    }

    if (userSchools.length === 1) {
      return userSchools[0];
    }

    // Sort by role hierarchy (ADMIN > MANAGER > TEACHER > USER)
    const roleHierarchy = {
      'ADMIN': 4,
      'MANAGER': 3,
      'TEACHER': 2,
      'USER': 1
    };

    return userSchools.sort((a, b) => {
      const aLevel = roleHierarchy[a.profile.role?.name as keyof typeof roleHierarchy] || 0;
      const bLevel = roleHierarchy[b.profile.role?.name as keyof typeof roleHierarchy] || 0;
      return bLevel - aLevel;
    })[0];
  }

  // Login user
  async login(credentials: { email?: string; phone?: string; password: string }): Promise<AuthUser> {
    const response = await apiClient.login(credentials);
    
    if (response.data) {
      // Clear cached data
      this.currentUser = null;
      this.userSchools = [];
      
      // Get fresh user data
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('Failed to get user data after login');
      }
      
      return user;
    }
    
    throw new Error('Login failed');
  }

  // Register user
  async register(userData: {
    name: string;
    email?: string;
    phone: string;
    password: string;
  }): Promise<void> {
    const response = await apiClient.register(userData);
    
    if (!response.data) {
      throw new Error('Registration failed');
    }
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
      this.userSchools = [];
      
      // Redirect to login
      window.location.href = '/login';
    }
  }

  // Clear cached data
  clearCache(): void {
    this.currentUser = null;
    this.userSchools = [];
  }

  // Get user's role in a specific school
  async getUserRoleInSchool(schoolId: number): Promise<string | null> {
    const userSchools = await this.getUserSchools();
    const userSchool = userSchools.find(us => us.school.id === schoolId);
    return userSchool?.profile.role?.name || null;
  }

  // Check if user can manage a specific school
  async canManageSchool(schoolId: number): Promise<boolean> {
    const role = await this.getUserRoleInSchool(schoolId);
    return role === 'ADMIN' || role === 'MANAGER' || role === 'TEACHER';
  }

  // Check if user can access admin features in a school
  async canAccessSchoolAdmin(schoolId: number): Promise<boolean> {
    const role = await this.getUserRoleInSchool(schoolId);
    return role === 'ADMIN' || role === 'MANAGER';
  }
}

export const authService = new AuthService(); 