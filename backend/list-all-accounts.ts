import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllAccounts() {
    try {
        console.log('\n📋 ALL REGISTERED ACCOUNTS');
        console.log('='.repeat(80));

        // Get all admins
        const admins = await prisma.admin.findMany({
            select: {
                email: true,
                fullName: true,
                createdAt: true
            }
        });

        console.log('\n👑 ADMIN ACCOUNTS');
        console.log('-'.repeat(80));
        if (admins.length === 0) {
            console.log('No admin accounts found');
        } else {
            admins.forEach((admin, index) => {
                console.log(`\n${index + 1}. ${admin.fullName}`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   Password: [Check with admin - typically set during setup]`);
                console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
            });
        }

        // Get all doctors
        const doctors = await prisma.doctor.findMany({
            select: {
                email: true,
                fullName: true,
                specialization: true,
                isActive: true,
                createdAt: true
            },
            orderBy: {
                fullName: 'asc'
            }
        });

        console.log('\n\n👨‍⚕️ DOCTOR ACCOUNTS');
        console.log('-'.repeat(80));
        if (doctors.length === 0) {
            console.log('No doctor accounts found');
        } else {
            doctors.forEach((doctor, index) => {
                console.log(`\n${index + 1}. ${doctor.fullName}`);
                console.log(`   Email: ${doctor.email}`);
                console.log(`   Password: password123`);
                console.log(`   Specialization: ${doctor.specialization}`);
                console.log(`   Status: ${doctor.isActive ? '✅ Active' : '❌ Inactive'}`);
                console.log(`   Created: ${doctor.createdAt.toLocaleDateString()}`);
            });
        }

        // Get all patients
        const patients = await prisma.user.findMany({
            select: {
                email: true,
                fullName: true,
                phone: true,
                createdAt: true
            },
            orderBy: {
                fullName: 'asc'
            }
        });

        console.log('\n\n👥 PATIENT ACCOUNTS');
        console.log('-'.repeat(80));
        if (patients.length === 0) {
            console.log('No patient accounts found');
        } else {
            patients.forEach((patient, index) => {
                console.log(`\n${index + 1}. ${patient.fullName}`);
                console.log(`   Email: ${patient.email}`);
                console.log(`   Password: [Set during registration]`);
                console.log(`   Phone: ${patient.phone}`);
                console.log(`   Created: ${patient.createdAt.toLocaleDateString()}`);
            });
        }

        console.log('\n\n' + '='.repeat(80));
        console.log('📊 SUMMARY');
        console.log('-'.repeat(80));
        console.log(`Total Admins: ${admins.length}`);
        console.log(`Total Doctors: ${doctors.length}`);
        console.log(`Total Patients: ${patients.length}`);
        console.log(`Total Accounts: ${admins.length + doctors.length + patients.length}`);
        console.log('='.repeat(80));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listAllAccounts();
