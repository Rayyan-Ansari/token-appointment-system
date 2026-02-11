import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDoctorQuery() {
    try {
        const doctors = await prisma.doctor.findMany({
            where: { isActive: true },
            select: {
                id: true,
                fullName: true,
                specialization: true,
                yearsExperience: true,
                qualification: true
            }
        });

        console.log('\n✅ Active Doctors Query Result:');
        console.log('================================');
        console.log(JSON.stringify({
            success: true,
            data: {
                doctors,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: doctors.length,
                    pages: 1
                }
            }
        }, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDoctorQuery();
