const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    console.log("Fixing DB state...");
    const doctor = await prisma.doctor.findFirst({ where: { email: 'dr.wilson@example.com' } });
    const patient = await prisma.user.findFirst({ where: { email: 'john.doe@example.com' } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let session = await prisma.session.findFirst({
        where: {
            doctorId: doctor.id,
            sessionDate: today
        }
    });

    if (!session) {
        session = await prisma.session.create({
            data: {
                doctorId: doctor.id,
                sessionDate: today,
                status: 'ACTIVE',
                currentTokenNo: 0,
                maxTokenNo: 50,
                startedAt: new Date()
            }
        });
        console.log("Created session:", session.id);
    } else {
        session = await prisma.session.update({
            where: { id: session.id },
            data: { status: 'ACTIVE', currentTokenNo: 0 }
        });
        console.log("Updated session:", session.id);
    }

    // Delete existing tokens for this session
    await prisma.token.deleteMany({ where: { sessionId: session.id } });

    // Create a new WAITING token for the patient
    const token = await prisma.token.create({
        data: {
            sessionId: session.id,
            patientId: patient.id,
            tokenNo: 1,
            status: 'WAITING'
        }
    });

    console.log("Created WAITING token:", token.id);
    await prisma.$disconnect();
}
fix();
