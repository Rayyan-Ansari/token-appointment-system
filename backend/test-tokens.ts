import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    try {
        console.log('Querying tokens...');
        const tokens = await prisma.token.findMany({
            include: {
                patient: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true,
                    }
                },
                session: {
                    include: {
                        doctor: {
                            select: {
                                fullName: true,
                                specialization: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                bookedAt: 'desc'
            }
        });

        console.log(`Found ${tokens.length} tokens.`);

        const mapped = tokens.map(token => ({
            id: token.id.toString(),
            tokenNo: token.tokenNo,
            status: token.status,
            patient: {
                id: token.patientId.toString(),
                fullName: token.patient.fullName,
                email: token.patient.email,
                phone: token.patient.phone,
            },
            doctor: {
                id: token.session.doctorId.toString(),
                fullName: token.session.doctor.fullName,
                specialization: token.session.doctor.specialization,
            },
            session: {
                id: token.session.id.toString(),
                sessionDate: token.session.sessionDate,
                status: token.session.status,
                currentTokenNo: token.session.currentTokenNo,
                maxTokenNo: token.session.maxTokenNo,
            }
        }));

        console.log('Successfully mapped tokens, first token:', mapped[0]);
    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
