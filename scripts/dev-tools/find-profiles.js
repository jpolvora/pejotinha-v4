
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
