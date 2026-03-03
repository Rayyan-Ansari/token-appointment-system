"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.approveRejectDoctorSchema = exports.adminDoctorsListSchema = exports.sessionAnalyticsSchema = exports.myTokensSchema = exports.bookTokenSchema = exports.doctorsListSchema = exports.updateProfileSchema = exports.loginSchema = exports.doctorRegisterSchema = exports.patientRegisterSchema = exports.phoneSchema = exports.passwordSchema = exports.emailSchema = exports.sexSchema = void 0;
const zod_1 = require("zod");
exports.sexSchema = zod_1.z.enum(['M', 'F', 'O']);
exports.emailSchema = zod_1.z.string().email().toLowerCase().trim();
exports.passwordSchema = zod_1.z.string().min(8, 'Password must be at least 8 characters');
exports.phoneSchema = zod_1.z.string().min(10, 'Phone number must be at least 10 digits');
exports.patientRegisterSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: exports.passwordSchema,
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters').trim(),
    phone: exports.phoneSchema,
    dob: zod_1.z.coerce.date(),
    sex: exports.sexSchema,
    address: zod_1.z.string().optional(),
});
exports.doctorRegisterSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: exports.passwordSchema,
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters').trim(),
    phone: exports.phoneSchema,
    dob: zod_1.z.coerce.date(),
    sex: exports.sexSchema,
    qualification: zod_1.z.string().min(3, 'Qualification is required').trim(),
    specialization: zod_1.z.string().min(3, 'Specialization is required').trim(),
    yearsExperience: zod_1.z.coerce.number().int().min(0, 'Years of experience cannot be negative'),
    licenseNumber: zod_1.z.string().min(5, 'License number is required').trim(),
});
exports.loginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters').trim().optional(),
    email: zod_1.z.string().email().toLowerCase().trim().optional(),
    phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits').optional(),
    currentPassword: zod_1.z.string().optional(),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters').optional(),
    workingHoursStart: zod_1.z.string().optional(),
    workingHoursEnd: zod_1.z.string().optional(),
});
exports.doctorsListSchema = zod_1.z.object({
    approved: zod_1.z.string().optional().default('true'),
    name: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    minExp: zod_1.z.coerce.number().int().min(0).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(10),
});
exports.bookTokenSchema = zod_1.z.object({
    doctorId: zod_1.z.coerce.bigint(),
});
exports.myTokensSchema = zod_1.z.object({
    doctorId: zod_1.z.coerce.bigint().optional(),
    status: zod_1.z.enum(['WAITING', 'CALLED', 'SERVED', 'CANCELED', 'NO_SHOW']).optional(),
});
exports.sessionAnalyticsSchema = zod_1.z.object({
    range: zod_1.z.enum(['today', 'week', 'month']).default('today'),
});
exports.adminDoctorsListSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(10),
});
exports.approveRejectDoctorSchema = zod_1.z.object({
    note: zod_1.z.string().optional(),
});
const validateRequest = (schema) => {
    return (data) => {
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
exports.validateRequest = validateRequest;
//# sourceMappingURL=validators.js.map