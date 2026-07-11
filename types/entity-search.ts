export interface EntitySearchOption {
  value: string;
  label: string;
  description?: string;
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
