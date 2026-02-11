import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
    const email = 'test@example.com';
    const password = 'password123';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if user exists
    const existing = await prisma.user.findUnique({
        where: { email }
    });

    if (existing) {
        console.log('✅ Test user already exists!');
        console.log('Email:', email);
        console.log('Password:', password);
        return;
    }

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            fullName: 'Test User',
            phone: '1234567890',
            dob: new Date('1990-01-01'),
            sex: 'MALE',
            address: '123 Test Street'
        }
    });

    console.log('✅ Test user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', user.id.toString());
}

createTestUser()
    .then(() => prisma.$disconnect())
    .catch((error) => {
        console.error('Error:', error);
        prisma.$disconnect();
    });
