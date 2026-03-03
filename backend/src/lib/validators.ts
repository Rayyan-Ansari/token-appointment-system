import { z } from 'zod';

// Base schemas
export const sexSchema = z.enum(['M', 'F', 'O']);
export const emailSchema = z.string().email().toLowerCase().trim();
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits');

// Auth schemas
export const patientRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  phone: phoneSchema,
  dob: z.coerce.date(),
  sex: sexSchema,
  address: z.string().optional(),
});

export const doctorRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  phone: phoneSchema,
  dob: z.coerce.date(),
  sex: sexSchema,
  qualification: z.string().min(3, 'Qualification is required').trim(),
  specialization: z.string().min(3, 'Specialization is required').trim(),
  yearsExperience: z.coerce.number().int().min(0, 'Years of experience cannot be negative'),
  licenseNumber: z.string().min(5, 'License number is required').trim(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
});

// Doctor schemas
export const doctorsListSchema = z.object({
  approved: z.string().optional().default('true'),
  name: z.string().optional(),
  specialization: z.string().optional(),
  minExp: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// Token schemas
export const bookTokenSchema = z.object({
  doctorId: z.coerce.bigint(),
});

export const myTokensSchema = z.object({
  doctorId: z.coerce.bigint().optional(),
  status: z.enum(['WAITING', 'CALLED', 'SERVED', 'CANCELED', 'NO_SHOW']).optional(),
});

// Session schemas
export const sessionAnalyticsSchema = z.object({
  range: z.enum(['today', 'week', 'month']).default('today'),
});

// Admin schemas
export const adminDoctorsListSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const approveRejectDoctorSchema = z.object({
  note: z.string().optional(),
});

// Utility function to validate request
export const validateRequest = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): T => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errorMessage = result.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    return result.data;
  };
};

// Export types
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