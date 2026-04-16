import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';

dotenv.config();

const HASHED_PASSWORD = 'password123';

const users = [
    // Normal Users
    {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        phone: '+91-9876543210',
        password: HASHED_PASSWORD,
        role: 'user',
    },
    {
        name: 'Priya Singh',
        email: 'priya.singh@example.com',
        phone: '+91-9876543211',
        password: HASHED_PASSWORD,
        role: 'user',
    },
    {
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        phone: '+91-9876543212',
        password: HASHED_PASSWORD,
        role: 'user',
    },
    // Agents
    {
        name: 'Vikram Sharma',
        email: 'vikram.sharma@example.com',
        phone: '+91-9876543220',
        password: HASHED_PASSWORD,
        role: 'agent',
        businessName: 'VikramRealty Solutions',
        address: '123 MG Road, Bengaluru',
        location: 'Bengaluru',
        expertise: 'NEW_LAUNCH',
    },
    {
        name: 'Neha Gupta',
        email: 'neha.gupta@example.com',
        phone: '+91-9876543221',
        password: HASHED_PASSWORD,
        role: 'agent',
        businessName: 'NehaProperty Consultants',
        address: '456 Bandra, Mumbai',
        location: 'Mumbai',
        expertise: 'RENT',
    },
    {
        name: 'Arjun Mishra',
        email: 'arjun.mishra@example.com',
        phone: '+91-9876543222',
        password: HASHED_PASSWORD,
        role: 'agent',
        businessName: 'ArjunEstate Premium',
        address: '789 DLF, Gurgaon',
        location: 'Gurgaon',
        expertise: 'RESALE',
    },
];

const seedUsers = async () => {
    try {
        const hashedPassword = await bcrypt.hash(HASHED_PASSWORD, 10);

        for (const user of users) {
            await prisma.user.upsert({
                where: { email: user.email },
                update: {
                    name: user.name,
                    phone: user.phone,
                    password: hashedPassword,
                    role: user.role,
                    businessName: user.businessName || null,
                    address: user.address || null,
                    location: user.location || null,
                    expertise: user.expertise || null,
                },
                create: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    password: hashedPassword,
                    role: user.role,
                    businessName: user.businessName || null,
                    address: user.address || null,
                    location: user.location || null,
                    expertise: user.expertise || null,
                },
            });
        }

        console.log('✅ Seeded 6 dummy users (3 normal users + 3 agents).');
    } catch (error) {
        console.error('Failed to seed users:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

seedUsers();
