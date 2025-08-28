export interface User {
  id: string;
  studentId?: string; // สำหรับนักศึกษา
  firstName: string;
  lastName: string;
  phone: string;
  email?: string; // สำหรับอาจารย์
  office?: string; // สำหรับอาจารย์
  role: 'student' | 'advisor';
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  advisorId: string;
  advisor: User;
  students: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  date: Date;
  time: string;
  location: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  studentId: string;
  advisorId: string;
  projectId?: string;
  student: User;
  advisor: User;
  project?: Project;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  appointmentId: string;
  userId: string;
  user: User;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment_reminder' | 'appointment_request' | 'appointment_confirmed' | 'appointment_rejected';
  title: string;
  message: string;
  isRead: boolean;
  appointmentId?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  studentId?: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
