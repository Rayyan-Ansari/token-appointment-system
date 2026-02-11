import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateDoctors() {
    try {
        // Update all doctors to be active
        const result = await prisma.doctor.updateMany({
            where: {
                isActive: false
            },
            data: {
                isActive: true
            }
        });

        console.log(`✅ Activated ${result.count} doctors`);

        // List all doctors
        const doctors = await prisma.doctor.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                specialization: true,
                isActive: true
            }
        });

        console.log('\n📋 All doctors:');
        doctors.forEach(doc => {
            console.log(`  - ${doc.fullName} (${doc.specialization}) - Active: ${doc.isActive}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

activateDoctors();
