import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.doctor.updateMany({
        where: {
            OR: [
                { workingHoursStart: null },
                { workingHoursEnd: null }
            ]
        },
        data: {
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00'
        }
    });
    console.log('Updated all doctors to have default working hours');
}

main().catch(console.error).finally(() => prisma.$disconnect());
