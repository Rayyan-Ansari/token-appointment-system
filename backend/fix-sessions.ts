import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSessions() {
    try {
        // Update all sessions with maxTokenNo = 0 to have maxTokenNo = 50
        const result = await prisma.session.updateMany({
            where: {
                maxTokenNo: 0
            },
            data: {
                maxTokenNo: 50
            }
        });

        console.log(`✅ Updated ${result.count} sessions to have maxTokenNo = 50`);

        // List all sessions
        const sessions = await prisma.session.findMany({
            select: {
                id: true,
                doctorId: true,
                sessionDate: true,
                status: true,
                currentTokenNo: true,
                maxTokenNo: true
            }
        });

        console.log('\n📋 All sessions:');
        sessions.forEach(session => {
            console.log(`  - Session ${session.id}: ${session.status} - ${session.currentTokenNo}/${session.maxTokenNo} tokens`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixSessions();
