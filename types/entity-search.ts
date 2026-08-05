export interface EntitySearchOption {
  value: string;
  label: string;
  description?: string;
}

/** `GET /users` returns academy profiles, not the `users` shape below. */
export interface EntitySearchProfilesResponse {
  profiles?: Array<{
    id: string;
    display_name?: string;
    full_name?: string;
    email?: string | null;
    phone_number?: string | null;
    role_name?: string | null;
  }>;
}

export interface EntitySearchUsersResponse {
  users?: Array<{
    id: number | string;
    display_name?: string;
    full_name?: string;
    name?: string;
    email?: string | null;
    phone_number?: string | null;
  }>;
}
