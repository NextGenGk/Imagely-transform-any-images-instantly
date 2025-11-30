import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    console.log('--- User Credits ---');
    for (const user of users) {
        console.log(`User ${user.id} (${user.email}): Credits=${user.credits}, Limit=${user.monthlyCreditLimit}`);
    }
}
main().finally(() => prisma.$disconnect());
