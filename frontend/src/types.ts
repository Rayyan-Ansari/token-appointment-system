// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  dob: string;
  sex: 'M' | 'F' | 'O';
  address?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  dob: string;
  sex: 'M' | 'F' | 'O';
  qualification: string;
  specialization: string;
  yearsExperience: number;
  licenseNumber: string;
  licenseDocumentPath?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Admin {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

// Session Types
export type SessionStatus = 'NOT_STARTED' | 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface Session {
  id: string;
  doctorId: string;
  sessionDate: string;
  status: SessionStatus;
  currentTokenNo: number;
  maxTokenNo: number;
  startedAt?: string;
  endedAt?: string;
  doctor?: Doctor;
}

export interface DoctorSessionResponse {
  session: Session;
  doctor: Doctor;
  myToken?: {
    id: string;
    tokenNo: number;
    status: TokenStatus;
    tokensAhead: number;
  } | null;
}

export interface DoctorsListResponse {
  doctors: Doctor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Token Types
export type TokenStatus = 'WAITING' | 'CALLED' | 'SERVED' | 'CANCELED' | 'NO_SHOW';

export interface Token {
  id: string;
  sessionId: string;
  patientId: string;
  tokenNo: number;
  status: TokenStatus;
  bookedAt: string;
  calledAt?: string;
  servedAt?: string;
  canceledAt?: string;
  noShowAt?: string;
  session?: Session;
  patient?: User;
}

// Approval Types
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DoctorApproval {
  id: string;
  doctorId: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  note?: string;
  createdAt: string;
  doctor?: Doctor;
}

export interface AdminStats {
  activeDoctors: number;
  pendingApprovals: number;
  totalPatients: number;
}

export interface DoctorDetails {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  specialization: string;
  qualification: string;
  yearsExperience: number;
  licenseNumber: string;
  createdAt: string;
}

export interface PatientDetails {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
}

// Auth Types
export type UserRole = 'patient' | 'doctor' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user?: User;
    doctor?: Doctor;
    admin?: Admin;
  };
}

export interface RegisterPatientData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  dob: string;
  sex: 'M' | 'F' | 'O';
  address?: string;
}

export interface RegisterDoctorData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  dob: string;
  sex: 'M' | 'F' | 'O';
  qualification: string;
  specialization: string;
  yearsExperience: number;
  licenseNumber: string;
  licenseDocument?: File;
}

export interface LoginData {
  email: string;
  password: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Socket Event Types
export interface SocketTokenUpdate {
  tokenId: string;
  status: TokenStatus;
  sessionId: string;
}

export interface SocketSessionUpdate {
  sessionId: string;
  status: SessionStatus;
  currentTokenNo: number;
}
