// src/services/auth.service.ts
import axiosInstance from '../config/axios.config';
import { AxiosError } from 'axios';
import { API_ENDPOINTS } from '../config/api.config';
import { disconnectSocket } from './socket.service';
import type {
  SignupData,
  LoginData,
  UpdateProfileData,
  User,
  AuthResponse,
  ProfileUpdateResponse,
  AvatarUploadResponse,
} from '../types/api.types';

// Re-export so components that import types from auth.service still work
export type {
  SignupData,
  LoginData,
  UpdateProfileData,
  User,
  AuthResponse,
  ProfileUpdateResponse,
  AvatarUploadResponse,
};

interface ErrorResponse {
  message: string;
}

class AuthService {

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.SIGNUP,
        data
      );
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage = (error.response.data as ErrorResponse)?.message || 'Signup failed';
        throw new Error(errorMessage);
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        data
      );
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage = (error.response.data as ErrorResponse)?.message || 'Login failed';
        throw new Error(errorMessage);
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout();
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!token && !!user;
  }

  updateUser(userData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  async getCurrentUserFromServer(): Promise<User> {
    try {
      const response = await axiosInstance.get<AuthResponse>(
        API_ENDPOINTS.AUTH.ME
      );
      if (!response.data.success || !response.data.user) {
        throw new Error('User not found in response');
      }
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      console.error('getCurrentUserFromServer failed:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          this.logout();
          throw new Error('Session expired. Please log in again.');
        }
        if (error.response?.status === 404) {
          throw new Error('Profile endpoint not found – check backend routes');
        }
      }
      throw new Error('Failed to load profile. Please try again.');
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await axiosInstance.patch<ProfileUpdateResponse>(
        API_ENDPOINTS.AUTH.UPDATE_PROFILE,
        data
      );
      if (!response.data.success || !response.data.user) {
        throw new Error('Profile update failed');
      }
      this.updateUser(response.data.user);
      return response.data.user;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage = (error.response.data as ErrorResponse)?.message || 'Profile update failed';
        throw new Error(errorMessage);
      }
      throw new Error('Network error during profile update');
    }
  }

  async uploadAvatar(base64Image: string): Promise<AvatarUploadResponse> {
    try {
      const response = await axiosInstance.post<AvatarUploadResponse>(
        API_ENDPOINTS.AUTH.UPLOAD_AVATAR,
        { avatar: base64Image }
      );
      if (!response.data.success) {
        throw new Error('Avatar upload failed');
      }
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.updateUser({ ...currentUser, avatar: response.data.avatar });
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage = (error.response.data as ErrorResponse)?.message || 'Avatar upload failed';
        throw new Error(errorMessage);
      }
      throw new Error('Network error during avatar upload');
    }
  }
}

export default new AuthService();