
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany();
  profiles.forEach(p => {
    if (p.settings && Object.keys(p.settings).length > 0) {
      console.log(`User ${p.userId}:`);
      console.log(JSON.stringify(p.settings, null, 2));
    }
  });
}

main();
