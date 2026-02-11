import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetDoctorPassword() {
    try {
        const email = 'dr.wilson@example.com';
        const newPassword = 'password123';

        // Hash the password
        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Update the doctor's password
        const doctor = await prisma.doctor.update({
            where: { email },
            data: { passwordHash }
        });

        console.log(`\n✅ Password reset successful!`);
        console.log(`\n📧 Email: ${email}`);
        console.log(`🔑 Password: ${newPassword}`);
        console.log(`\n👨‍⚕️ Doctor: ${doctor.fullName}`);
        console.log(`🏥 Specialization: ${doctor.specialization}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDoctorPassword();
