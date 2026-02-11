import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listDoctors() {
    try {
        const doctors = await prisma.doctor.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                specialization: true,
                isActive: true
            }
        });

        console.log('\n📋 All doctors in database:');
        console.log('================================');
        doctors.forEach(doc => {
            console.log(`\n👨‍⚕️ ${doc.fullName}`);
            console.log(`   Email: ${doc.email}`);
            console.log(`   Specialization: ${doc.specialization}`);
            console.log(`   Active: ${doc.isActive ? '✅ Yes' : '❌ No'}`);
        });
        console.log('\n================================');
        console.log(`Total doctors: ${doctors.length}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listDoctors();
