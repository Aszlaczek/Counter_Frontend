import api from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenRefreshResponse,
  UserProfile,
} from "../type";

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/api/auth/login", data);
    return res.data;
  },

  async register(data: RegisterRequest): Promise<UserProfile> {
    const res = await api.post<UserProfile>("/api/auth/register", data);
    return res.data;
  },

  async refresh(refreshToken: string): Promise<TokenRefreshResponse> {
    const res = await api.post<TokenRefreshResponse>("/api/auth/refresh", {
      refresh_token: refreshToken,
    });
    return res.data;
  },

  async getMe(): Promise<UserProfile> {
    const res = await api.get<UserProfile>("/api/auth/me");
    return res.data;
  },
};
