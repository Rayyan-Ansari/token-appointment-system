import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupInvalidTokens() {
    try {
        console.log('\n🔍 Checking for invalid tokens...');

        // Find all sessions
        const sessions = await prisma.session.findMany({
            include: {
                tokens: {
                    orderBy: { tokenNo: 'asc' }
                },
                doctor: {
                    select: {
                        fullName: true
                    }
                }
            }
        });

        for (const session of sessions) {
            console.log(`\n📋 Session for ${session.doctor.fullName} on ${session.sessionDate.toDateString()}`);
            console.log(`   Max Tokens Allowed: ${session.maxTokenNo}`);
            console.log(`   Total Tokens Booked: ${session.tokens.length}`);

            // Find tokens that exceed maxTokenNo
            const invalidTokens = session.tokens.filter(t => t.tokenNo > session.maxTokenNo);

            if (invalidTokens.length > 0) {
                console.log(`\n   ⚠️  Found ${invalidTokens.length} invalid token(s):`);

                for (const token of invalidTokens) {
                    console.log(`      - Token #${token.tokenNo} (ID: ${token.id}) - Status: ${token.status}`);

                    // Delete the invalid token
                    await prisma.token.delete({
                        where: { id: token.id }
                    });

                    console.log(`      ✅ Deleted Token #${token.tokenNo}`);
                }
            } else {
                console.log(`   ✅ All tokens are valid`);
            }

            // Show remaining valid tokens
            const validTokens = session.tokens.filter(t => t.tokenNo <= session.maxTokenNo);
            if (validTokens.length > 0) {
                console.log(`\n   Valid Tokens: ${validTokens.map(t => `#${t.tokenNo}`).join(', ')}`);
            }
        }

        console.log('\n\n✅ Cleanup completed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupInvalidTokens();
