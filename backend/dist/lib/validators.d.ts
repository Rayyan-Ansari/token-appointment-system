import { z } from 'zod';
export declare const sexSchema: z.ZodEnum<["M", "F", "O"]>;
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const phoneSchema: z.ZodString;
export declare const patientRegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
    phone: z.ZodString;
    dob: z.ZodDate;
    sex: z.ZodEnum<["M", "F", "O"]>;
    address: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    dob?: Date;
    sex?: "M" | "F" | "O";
    address?: string;
}, {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    dob?: Date;
    sex?: "M" | "F" | "O";
    address?: string;
}>;
export declare const doctorRegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
    phone: z.ZodString;
    dob: z.ZodDate;
    sex: z.ZodEnum<["M", "F", "O"]>;
    qualification: z.ZodString;
    specialization: z.ZodString;
    yearsExperience: z.ZodNumber;
    licenseNumber: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    dob?: Date;
    sex?: "M" | "F" | "O";
    qualification?: string;
    specialization?: string;
    yearsExperience?: number;
    licenseNumber?: string;
}, {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    dob?: Date;
    sex?: "M" | "F" | "O";
    qualification?: string;
    specialization?: string;
    yearsExperience?: number;
    licenseNumber?: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
    password?: string;
}, {
    email?: string;
    password?: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    currentPassword: z.ZodOptional<z.ZodString>;
    newPassword: z.ZodOptional<z.ZodString>;
    workingHoursStart: z.ZodOptional<z.ZodString>;
    workingHoursEnd: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string;
    fullName?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    workingHoursStart?: string;
    workingHoursEnd?: string;
}, {
    email?: string;
    fullName?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    workingHoursStart?: string;
    workingHoursEnd?: string;
}>;
export declare const doctorsListSchema: z.ZodObject<{
    approved: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    name: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    minExp: z.ZodOptional<z.ZodNumber>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    specialization?: string;
    approved?: string;
    name?: string;
    minExp?: number;
    page?: number;
    limit?: number;
}, {
    specialization?: string;
    approved?: string;
    name?: string;
    minExp?: number;
    page?: number;
    limit?: number;
}>;
export declare const bookTokenSchema: z.ZodObject<{
    doctorId: z.ZodBigInt;
}, "strip", z.ZodTypeAny, {
    doctorId?: bigint;
}, {
    doctorId?: bigint;
}>;
export declare const myTokensSchema: z.ZodObject<{
    doctorId: z.ZodOptional<z.ZodBigInt>;
    status: z.ZodOptional<z.ZodEnum<["WAITING", "CALLED", "SERVED", "CANCELED", "NO_SHOW"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "WAITING" | "CALLED" | "SERVED" | "CANCELED" | "NO_SHOW";
    doctorId?: bigint;
}, {
    status?: "WAITING" | "CALLED" | "SERVED" | "CANCELED" | "NO_SHOW";
    doctorId?: bigint;
}>;
export declare const sessionAnalyticsSchema: z.ZodObject<{
    range: z.ZodDefault<z.ZodEnum<["today", "week", "month"]>>;
}, "strip", z.ZodTypeAny, {
    range?: "week" | "today" | "month";
}, {
    range?: "week" | "today" | "month";
}>;
export declare const adminDoctorsListSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "APPROVED" | "REJECTED";
    page?: number;
    limit?: number;
}, {
    status?: "PENDING" | "APPROVED" | "REJECTED";
    page?: number;
    limit?: number;
}>;
export declare const approveRejectDoctorSchema: z.ZodObject<{
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    note?: string;
}, {
    note?: string;
}>;
export declare const validateRequest: <T>(schema: z.ZodSchema<T>) => (data: unknown) => T;
export type PatientRegisterInput = z.infer<typeof patientRegisterSchema>;
export type DoctorRegisterInput = z.infer<typeof doctorRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DoctorsListQuery = z.infer<typeof doctorsListSchema>;
export type BookTokenInput = z.infer<typeof bookTokenSchema>;
export type MyTokensQuery = z.infer<typeof myTokensSchema>;
export type SessionAnalyticsQuery = z.infer<typeof sessionAnalyticsSchema>;
export type AdminDoctorsListQuery = z.infer<typeof adminDoctorsListSchema>;
export type ApproveRejectDoctorInput = z.infer<typeof approveRejectDoctorSchema>;
//# sourceMappingURL=validators.d.ts.map