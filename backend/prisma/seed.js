"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 12;
async function main() {
    console.log('🌱 Starting database seed...');
    const adminPassword = await bcrypt_1.default.hash('admin123!@#', SALT_ROUNDS);
    const admin = await prisma.admin.upsert({
        where: { email: 'admin@tokenappointment.com' },
        update: {},
        create: {
            email: 'admin@tokenappointment.com',
            passwordHash: adminPassword,
            fullName: 'System Administrator'
        }
    });
    console.log('✅ Admin user created:', admin.email);
    const patientPassword = await bcrypt_1.default.hash('patient123', SALT_ROUNDS);
    const patient1 = await prisma.user.upsert({
        where: { email: 'john.doe@example.com' },
        update: {},
        create: {
            email: 'john.doe@example.com',
            passwordHash: patientPassword,
            fullName: 'John Doe',
            phone: '+1234567890',
            dob: new Date('1990-05-15'),
            sex: 'M',
            address: '123 Main St, City, State 12345'
        }
    });
    const patient2 = await prisma.user.upsert({
        where: { email: 'jane.smith@example.com' },
        update: {},
        create: {
            email: 'jane.smith@example.com',
            passwordHash: patientPassword,
            fullName: 'Jane Smith',
            phone: '+1234567891',
            dob: new Date('1985-08-22'),
            sex: 'F',
            address: '456 Oak Ave, City, State 12345'
        }
    });
    console.log('✅ Sample patients created');
    const doctorPassword = await bcrypt_1.default.hash('doctor123', SALT_ROUNDS);
    const doctor1 = await prisma.doctor.upsert({
        where: { email: 'dr.wilson@example.com' },
        update: {},
        create: {
            email: 'dr.wilson@example.com',
            passwordHash: doctorPassword,
            fullName: 'Dr. Sarah Wilson',
            phone: '+1234567892',
            dob: new Date('1975-03-10'),
            sex: 'F',
            qualification: 'MBBS, MD Internal Medicine',
            specialization: 'Internal Medicine',
            yearsExperience: 15,
            licenseNumber: 'MED-12345',
            isActive: true
        }
    });
    const approval1 = await prisma.doctorApproval.create({
        data: {
            doctorId: doctor1.id,
            status: 'APPROVED',
            reviewedBy: admin.id,
            reviewedAt: new Date(),
            note: 'Verified credentials and license'
        }
    });
    const doctor2 = await prisma.doctor.upsert({
        where: { email: 'dr.johnson@example.com' },
        update: {},
        create: {
            email: 'dr.johnson@example.com',
            passwordHash: doctorPassword,
            fullName: 'Dr. Michael Johnson',
            phone: '+1234567893',
            dob: new Date('1980-11-05'),
            sex: 'M',
            qualification: 'MBBS, MS Orthopedics',
            specialization: 'Orthopedics',
            yearsExperience: 12,
            licenseNumber: 'MED-67890',
            isActive: false
        }
    });
    const approval2 = await prisma.doctorApproval.create({
        data: {
            doctorId: doctor2.id,
            status: 'PENDING'
        }
    });
    const doctor3 = await prisma.doctor.upsert({
        where: { email: 'dr.patel@example.com' },
        update: {},
        create: {
            email: 'dr.patel@example.com',
            passwordHash: doctorPassword,
            fullName: 'Dr. Raj Patel',
            phone: '+1234567894',
            dob: new Date('1978-07-20'),
            sex: 'M',
            qualification: 'MBBS, DM Cardiology',
            specialization: 'Cardiology',
            yearsExperience: 18,
            licenseNumber: 'MED-11111',
            isActive: true
        }
    });
    const approval3 = await prisma.doctorApproval.create({
        data: {
            doctorId: doctor3.id,
            status: 'APPROVED',
            reviewedBy: admin.id,
            reviewedAt: new Date(),
            note: 'Excellent credentials and experience'
        }
    });
    console.log('✅ Sample doctors created');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sampleSession = await prisma.session.upsert({
        where: {
            doctorId_sessionDate: {
                doctorId: doctor1.id,
                sessionDate: today
            }
        },
        update: {},
        create: {
            doctorId: doctor1.id,
            sessionDate: today,
            status: 'ACTIVE',
            currentTokenNo: 2,
            maxTokenNo: 5,
            startedAt: new Date()
        }
    });
    const tokens = [
        { tokenNo: 1, status: 'SERVED', patientId: patient1.id },
        { tokenNo: 2, status: 'SERVED', patientId: patient2.id },
        { tokenNo: 3, status: 'CALLED', patientId: patient1.id },
        { tokenNo: 4, status: 'WAITING', patientId: patient2.id }
    ];
    await prisma.token.deleteMany({
        where: {
            sessionId: sampleSession.id
        }
    });
    for (const tokenData of tokens) {
        await prisma.token.upsert({
            where: {
                sessionId_tokenNo: {
                    sessionId: sampleSession.id,
                    tokenNo: tokenData.tokenNo
                }
            },
            update: {},
            create: {
                sessionId: sampleSession.id,
                patientId: tokenData.patientId,
                tokenNo: tokenData.tokenNo,
                status: tokenData.status,
                ...(tokenData.status === 'SERVED' && {
                    calledAt: new Date(Date.now() - 60000),
                    servedAt: new Date(Date.now() - 30000)
                }),
                ...(tokenData.status === 'CALLED' && {
                    calledAt: new Date()
                })
            }
        });
        await prisma.tokenLog.create({
            data: {
                tokenId: (await prisma.token.findFirst({
                    where: {
                        sessionId: sampleSession.id,
                        tokenNo: tokenData.tokenNo
                    }
                })).id,
                sessionId: sampleSession.id,
                doctorId: doctor1.id,
                patientId: tokenData.patientId,
                action: 'BOOKED',
                meta: {
                    tokenNo: tokenData.tokenNo
                }
            }
        });
    }
    console.log('✅ Sample session and tokens created');
    console.log('🎉 Database seed completed successfully!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log('👑 Admin: admin@tokenappointment.com / admin123!@#');
    console.log('👩‍⚕️ Doctor: dr.wilson@example.com / doctor123');
    console.log('🧑‍⚕️ Doctor: dr.patel@example.com / doctor123');
    console.log('👤 Patient: john.doe@example.com / patient123');
    console.log('👤 Patient: jane.smith@example.com / patient123');
    console.log('');
}
main()
    .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map