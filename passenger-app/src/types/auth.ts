export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'PASSENGER' | 'DRIVER' | 'ADMIN';
  is_active?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    access: string;
    refresh: string;
    user: UserProfile;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
  };
}

