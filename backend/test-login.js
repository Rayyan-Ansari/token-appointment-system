const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function test() {
    const admin = await prisma.admin.findUnique({ where: { email: 'admin@tokenappointment.com' } });
    if (!admin) {
        console.log("Admin not found!");
        return;
    }

    console.log("Admin hash: ", admin.passwordHash);
    const isValid = await bcrypt.compare('admin123!@#', admin.passwordHash);
    console.log("Is valid? ", isValid);
}

test().finally(() => prisma.$disconnect());
