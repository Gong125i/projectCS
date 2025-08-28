import axios from 'axios';
import type { 
  User, 
  Project, 
  Appointment, 
  Comment, 
  Notification, 
  LoginCredentials, 
  AuthResponse,
  ApiResponse 
} from '../types/index.js';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },
};

// User API
export const userAPI = {
  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${userId}`, data);
    return response.data.data!;
  },
  
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data!;
  },
};

// Project API
export const projectAPI = {
  createProject: async (data: { name: string }): Promise<Project> => {
    const response = await api.post<ApiResponse<Project>>('/projects', data);
    return response.data.data!;
  },
  
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get<ApiResponse<Project[]>>('/projects');
    return response.data.data!;
  },
  
  updateProject: async (projectId: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put<ApiResponse<Project>>(`/projects/${projectId}`, data);
    return response.data.data!;
  },
  
  deleteProject: async (projectId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}`);
  },
  
  inviteStudent: async (projectId: string, studentId: string): Promise<Project> => {
    const response = await api.post<ApiResponse<Project>>(`/projects/${projectId}/students`, { studentId });
    return response.data.data!;
  },
  
  removeStudent: async (projectId: string, studentId: string): Promise<Project> => {
    const response = await api.delete<ApiResponse<Project>>(`/projects/${projectId}/students/${studentId}`);
    return response.data.data!;
  },
};

// Appointment API
export const appointmentAPI = {
  createAppointment: async (data: {
    date: string;
    time: string;
    location: string;
    notes?: string;
    advisorId: string;
    projectId?: string;
  }): Promise<Appointment> => {
    const response = await api.post<ApiResponse<Appointment>>('/appointments', data);
    return response.data.data!;
  },
  
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments');
    return response.data.data!;
  },
  
  getAppointment: async (appointmentId: string): Promise<Appointment> => {
    const response = await api.get<ApiResponse<Appointment>>(`/appointments/${appointmentId}`);
    return response.data.data!;
  },
  
  updateAppointment: async (appointmentId: string, data: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${appointmentId}`, data);
    return response.data.data!;
  },
  
  deleteAppointment: async (appointmentId: string): Promise<void> => {
    await api.delete(`/appointments/${appointmentId}`);
  },
  
  confirmAppointment: async (appointmentId: string): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${appointmentId}/confirm`);
    return response.data.data!;
  },
  
  rejectAppointment: async (appointmentId: string): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${appointmentId}/reject`);
    return response.data.data!;
  },
  
  completeAppointment: async (appointmentId: string): Promise<Appointment> => {
    const response = await api.put<ApiResponse<Appointment>>(`/appointments/${appointmentId}/complete`);
    return response.data.data!;
  },
};

// Comment API
export const commentAPI = {
  addComment: async (appointmentId: string, content: string): Promise<Comment> => {
    const response = await api.post<ApiResponse<Comment>>(`/appointments/${appointmentId}/comments`, { content });
    return response.data.data!;
  },
  
  getComments: async (appointmentId: string): Promise<Comment[]> => {
    const response = await api.get<ApiResponse<Comment[]>>(`/appointments/${appointmentId}/comments`);
    return response.data.data!;
  },
};

// Notification API
export const notificationAPI = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications');
    return response.data.data!;
  },
  
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await api.put<ApiResponse<Notification>>(`/notifications/${notificationId}/read`);
    return response.data.data!;
  },
  
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },
};

// CSV Import API
export const importAPI = {
  importUsers: async (file: File): Promise<{ success: boolean; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>('/import/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  },
};

export default api;
