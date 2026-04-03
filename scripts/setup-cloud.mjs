import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import crypto from 'crypto';

console.log('🚀 Configurando ambiente remoto (Supabase Cloud)...\n');

// 1. Verificar se o projeto está linkado
if (!existsSync('supabase/.temp/project-ref')) {
  console.log('🔗 \x1b[33mProjeto não linkado detectado. Iniciando link...\x1b[0m');
  try {
    execSync('npx supabase link', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Falha ao vincular o projeto Supabase.');
    process.exit(1);
  }
}

const projectRef = readFileSync('supabase/.temp/project-ref', 'utf8').trim();
console.log(`🔗 Projeto detectado: ${projectRef}`);

const envPath = '.env.cloud';
let envContent = '';

// Use current .env.cloud if it exists, otherwise use .env.example
if (existsSync(envPath)) {
  envContent = readFileSync(envPath, 'utf8');
} else if (existsSync('.env.example')) {
  envContent = readFileSync('.env.example', 'utf8');
}

const updateEnv = (key, value) => {
  if (!value) return;
  const regex = new RegExp(`^${key}=.*`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }
};

// predictable URLs (Using regional poolers for better IPv4/DNS compatibility)
const dbHost = `aws-0-us-east-1.pooler.supabase.com`;
const qualifiedUser = `postgres.${projectRef}`;
const apiUrl = `https://${projectRef}.supabase.co`;

updateEnv('NEXT_PUBLIC_SUPABASE_URL', apiUrl);
updateEnv('DATABASE_URL', `postgresql://${qualifiedUser}:[YOUR_PASSWORD]@${dbHost}:6543/postgres?pgbouncer=true`);
updateEnv('DIRECT_URL', `postgresql://${qualifiedUser}:[YOUR_PASSWORD]@${dbHost}:5432/postgres`);
updateEnv('POSTGRES_USER', qualifiedUser);
updateEnv('POSTGRES_HOST', dbHost);
updateEnv('DB_PORT', '6543');
updateEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY', ''); // Placeholder for manual fill

// Handle encryption secret
const hasEncryptionSecret = envContent.match(/^ENCRYPTION_SECRET=(?!("|')?(your_32_byte_secret_here_|your_32_chars_long_encryption_secret).*("|')?).+/m);
if (!hasEncryptionSecret) {
  const secret = crypto.randomBytes(32).toString('hex');
  updateEnv('ENCRYPTION_SECRET', secret);
}

writeFileSync(envPath, envContent.trim() + '\n');
console.log(`✅ Arquivo ${envPath} preparado com as URLs do projeto ${projectRef}.`);

try {
    execSync('npx prisma generate', { stdio: 'inherit' });
} catch (e) {}

console.log('\n🎉 Setup Cloud concluído (parte técnica)!');

