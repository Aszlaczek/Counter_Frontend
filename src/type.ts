// ===== Local Types (existing) =====
export type User = {
  id: number | null;
  name: string;
  surname: string;
  hours: string;
  date: string;
};

// ===== API Types =====

// Auth
export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  surname: string;
  username: string;
  email?: string | null;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in_minutes: number;
  refresh_token_expires_in_days: number;
  admin: {
    id: number;
    name: string;
    surname: string;
    username: string;
    email: string | null;
    is_active: boolean;
    created_at: string;
  };
};

export type RefreshRequest = {
  refresh_token: string;
};

export type TokenRefreshResponse = {
  access_token: string;
  token_type: string;
};

export type UserProfile = {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
};

// Person
export type Person = {
  id: number;
  name: string;
  surname: string;
  faculty: string;
  is_working: boolean;
  created_by_id: number;
  created_at: string;
  updated_at: string;
};

export type PersonCreate = {
  name: string;
  surname: string;
  faculty?: string | null;
  is_working?: boolean | null;
};

export type PersonUpdate = {
  name?: string | null;
  surname?: string | null;
  faculty?: string | null;
  is_working?: boolean | null;
};

export type PersonDetailResponse = Person & {
  total_extra_hours: number;
  extra_hours_count: number;
};

// Extra Hours
export type ExtraHours = {
  id: number;
  person_id: number;
  hours: number;
  minutes: number;
  description: string | null;
  date: string;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  edited_by_id: number | null;
};

export type ExtraHoursCreate = {
  person_id: number;
  hours?: number;
  minutes?: number;
  description?: string | null;
  date?: string | null;
};

export type ExtraHoursUpdate = {
  hours?: number | null;
  minutes?: number | null;
  description?: string | null;
  date?: string | null;
};

export type ExtraHoursSummary = {
  person_id: number;
  person_name: string; // combined "First Last"
  total_hours: number;
  total_minutes: number;
  decimal_hours: number;
  total_records: number;
};
