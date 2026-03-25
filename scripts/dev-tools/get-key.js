
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.findFirst();
  console.log(JSON.stringify(profile.settings, null, 2));
}

main();
