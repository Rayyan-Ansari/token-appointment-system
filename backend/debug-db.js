const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    const doctor = await prisma.doctor.findFirst({
        where: { email: 'dr.wilson@example.com' }
    });
    console.log("Doctor:", doctor);
    if (!doctor) return;

    const sessions = await prisma.session.findMany({
        where: { doctorId: doctor.id }
    });
    console.log("Sessions:", sessions);

    const tokens = await prisma.token.findMany({
        where: { sessionId: sessions[0]?.id }
    });
    console.log("Tokens:", tokens);

    await prisma.$disconnect();
}
debug();
