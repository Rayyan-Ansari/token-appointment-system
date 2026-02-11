import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSessionData() {
    try {
        console.log('\n🔧 Fixing Session Data...');

        // 1. Reset maxTokenNo to 50 for all active/today's sessions
        // We assume the default limit should be 50.
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updatedSessions = await prisma.session.updateMany({
            where: {
                sessionDate: today,
                maxTokenNo: { gt: 50 } // Find sessions where limit was wrongly increased
            },
            data: {
                maxTokenNo: 50
            }
        });

        console.log(`\n✅ Reset maxTokenNo to 50 for ${updatedSessions.count} session(s).`);

        // 2. Now delete any tokens that have tokenNo > 50
        const deletedTokens = await prisma.token.deleteMany({
            where: {
                tokenNo: { gt: 50 }
            }
        });

        console.log(`\n✅ Deleted ${deletedTokens.count} invalid token(s) (tokenNo > 50).`);

        // 3. Reset currentTokenNo if it's > 50 (just in case)
        await prisma.session.updateMany({
            where: {
                sessionDate: today,
                currentTokenNo: { gt: 50 }
            },
            data: {
                currentTokenNo: 0
            }
        });
        console.log(`\n✅ Verified session currentTokenNo.`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixSessionData();
