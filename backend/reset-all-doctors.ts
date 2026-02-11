import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAllDoctorPasswords() {
    try {
        const password = 'password123';
        const passwordHash = await bcrypt.hash(password, 12);

        // Update all doctors with the same password
        const doctors = [
            'dr.wilson@example.com',
            'dr.patel@example.com',
            'dr.johnson@example.com'
        ];

        for (const email of doctors) {
            const doctor = await prisma.doctor.update({
                where: { email },
                data: { passwordHash },
                select: {
                    email: true,
                    fullName: true,
                    specialization: true
                }
            });

            console.log(`\n✅ Password reset for: ${doctor.fullName}`);
            console.log(`   📧 Email: ${doctor.email}`);
            console.log(`   🏥 Specialization: ${doctor.specialization}`);
        }

        console.log(`\n🔑 Password for all doctors: ${password}`);
        console.log('\n📋 Doctor Login Credentials:');
        console.log('================================');
        console.log('1. Dr. Sarah Wilson');
        console.log('   Email: dr.wilson@example.com');
        console.log('   Password: password123');
        console.log('   Specialization: Internal Medicine');
        console.log('');
        console.log('2. Dr. Raj Patel');
        console.log('   Email: dr.patel@example.com');
        console.log('   Password: password123');
        console.log('   Specialization: Cardiology');
        console.log('');
        console.log('3. Dr. Michael Johnson');
        console.log('   Email: dr.johnson@example.com');
        console.log('   Password: password123');
        console.log('   Specialization: Orthopedics');
        console.log('================================');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAllDoctorPasswords();
