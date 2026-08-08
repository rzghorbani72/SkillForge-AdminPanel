/** Shapes returned by GET /users/:id/details (UsersService.getUserManagementDetails). */

export interface UserDetailsCourseRef {
  id: string;
  uuid?: string;
  title: string | null;
}

export interface UserDetailsEnrollment {
  id: string;
  status: string | null;
  progress?: number | null;
  enrolled_at: string | null;
  completed_at?: string | null;
  Course?: UserDetailsCourseRef | null;
}

export interface UserDetailsPayment {
  id: string;
  amount: number | null;
  status: string | null;
  created_at: string | null;
  Course?: UserDetailsCourseRef | null;
  Order?: {
    order_number: string | null;
    total_amount: number | null;
    status: string | null;
    payment_status: string | null;
  } | null;
}

export interface UserDetailsAcademyRole {
  profile_id: string;
  academy_id: string | null;
  academy_name: string | null;
  role: string | null;
  is_active: boolean;
}

export interface UserDetailsResponse {
  profile: {
    id: string;
    display_name: string | null;
    role_name: string | null;
    role_label: string | null;
    role_hierarchy_level: number | null;
    academy_name: string | null;
  };
  user: {
    id: string;
    email: string | null;
    phone_number: string | null;
  };
  roles_across_academies: UserDetailsAcademyRole[];
  purchase_history: UserDetailsPayment[];
  enrollments: UserDetailsEnrollment[];
}
