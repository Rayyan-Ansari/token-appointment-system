import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
    LoginResponse,
    LoginData,
    RegisterPatientData,
    RegisterDoctorData,
    ApiResponse,
    Session,
    DoctorSessionResponse,
    DoctorsListResponse,
    Token,
    DoctorApproval,
    AdminStats,
    DoctorDetails,
    PatientDetails
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError<ApiResponse>) => {
                if (error.response?.status === 401) {
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth APIs
    async loginPatient(data: LoginData): Promise<LoginResponse> {
        const response = await this.client.post<LoginResponse>('/api/auth/patient/login', data);
        return response.data;
    }

    async loginDoctor(data: LoginData): Promise<LoginResponse> {
        const response = await this.client.post<LoginResponse>('/api/auth/doctor/login', data);
        return response.data;
    }

    async loginAdmin(data: LoginData): Promise<LoginResponse> {
        const response = await this.client.post<LoginResponse>('/api/auth/admin/login', data);
        return response.data;
    }

    async registerPatient(data: RegisterPatientData): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/api/auth/patient/register', data);
        return response.data;
    }

    async registerDoctor(data: RegisterDoctorData): Promise<ApiResponse> {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, value);
            }
        });

        const response = await this.client.post<ApiResponse>('/api/auth/doctor/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async getMe(): Promise<ApiResponse> {
        const response = await this.client.get<ApiResponse>('/api/auth/me');
        return response.data;
    }

    async updateProfile(data: any): Promise<ApiResponse> {
        const response = await this.client.put<ApiResponse>('/api/auth/profile', data);
        return response.data;
    }

    // Doctor APIs
    async getDoctors(): Promise<ApiResponse<DoctorsListResponse>> {
        const response = await this.client.get<ApiResponse<DoctorsListResponse>>('/api/doctors');
        return response.data;
    }

    async getDoctorSession(doctorId: string): Promise<ApiResponse<DoctorSessionResponse>> {
        const response = await this.client.get<ApiResponse<DoctorSessionResponse>>(`/api/doctors/${doctorId}/session`);
        return response.data;
    }

    async startSession(): Promise<ApiResponse<Session>> {
        const response = await this.client.post<ApiResponse<Session>>('/api/doctors/session/start');
        return response.data;
    }

    async pauseSession(): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/api/doctors/session/pause');
        return response.data;
    }

    async resumeSession(): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/api/doctors/session/resume');
        return response.data;
    }

    async callNextToken(): Promise<ApiResponse<Token>> {
        const response = await this.client.post<ApiResponse<Token>>('/api/doctors/session/next');
        return response.data;
    }

    async endSession(): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>('/api/doctors/session/end');
        return response.data;
    }

    // Token APIs
    async bookToken(doctorId: string): Promise<ApiResponse<Token>> {
        const response = await this.client.post<ApiResponse<Token>>('/api/tokens/book', { doctorId });
        return response.data;
    }

    async getMyTokens(): Promise<ApiResponse<Token[]>> {
        const response = await this.client.get<ApiResponse<Token[]>>('/api/tokens/my');
        return response.data;
    }

    async getSessionTokens(sessionId: string): Promise<ApiResponse<Token[]>> {
        const response = await this.client.get<ApiResponse<Token[]>>(`/api/tokens/session/${sessionId}`);
        return response.data;
    }

    // Admin APIs (to be implemented based on backend routes)
    async getPendingApprovals(): Promise<ApiResponse<DoctorApproval[]>> {
        const response = await this.client.get<ApiResponse<DoctorApproval[]>>('/api/admin/approvals/pending');
        return response.data;
    }

    async getDashboardStats(): Promise<ApiResponse<AdminStats>> {
        const response = await this.client.get<ApiResponse<AdminStats>>('/api/admin/stats');
        return response.data;
    }

    async approveDoctor(approvalId: string, note?: string): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>(`/api/admin/approvals/${approvalId}/approve`, { note });
        return response.data;
    }

    async rejectDoctor(approvalId: string, note?: string): Promise<ApiResponse> {
        const response = await this.client.post<ApiResponse>(`/api/admin/approvals/${approvalId}/reject`, { note });
        return response.data;
    }

    async getAllDoctors(): Promise<ApiResponse<DoctorDetails[]>> {
        const response = await this.client.get<ApiResponse<DoctorDetails[]>>('/api/admin/doctors');
        return response.data;
    }

    async deleteDoctor(doctorId: string): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>(`/api/admin/doctors/${doctorId}`);
        return response.data;
    }

    async getAllPatients(): Promise<ApiResponse<PatientDetails[]>> {
        const response = await this.client.get<ApiResponse<PatientDetails[]>>('/api/admin/patients');
        return response.data;
    }

    async deletePatient(patientId: string): Promise<ApiResponse> {
        const response = await this.client.delete<ApiResponse>(`/api/admin/patients/${patientId}`);
        return response.data;
    }
}

export const api = new ApiClient();
