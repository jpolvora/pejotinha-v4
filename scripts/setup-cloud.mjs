import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import crypto from 'crypto';

console.log('🚀 Configurando ambiente remoto (Supabase Cloud)...\n');

// 1. Verificar se o projeto está linkado
if (!existsSync('supabase/.temp/project-ref')) {
  console.error('❌ Projeto não linkado ao Supabase.');
  console.log('Execute "npm run supabase:link" primeiro.');
  process.exit(1);
}

const projectRef = readFileSync('supabase/.temp/project-ref', 'utf8').trim();
console.log(`🔗 Projeto detectado: ${projectRef}`);

// 2. Definir URLs Remotas baseadas no Project Ref
const apiUrl = `https://${projectRef}.supabase.co`;

// 3. Tentar obter chaves (o status -o json é local-only, então vamos avisar o usuário se não estiverem no .env.cloud)
const envPath = '.env.cloud';
let envContent = '';

// Usar .env ou .env.example como base
if (existsSync('.env')) {
  envContent = readFileSync('.env', 'utf8');
} else if (existsSync('.env.example')) {
  envContent = readFileSync('.env.example', 'utf8');
} else if (existsSync(envPath)) {
  envContent = readFileSync(envPath, 'utf8');
}

// Helper para atualizar variáveis mantendo comentários e estrutura
const updateEnv = (key, value) => {
  if (!value) return;
  const regex = new RegExp(`^${key}=.*`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }
};

// Preencher credenciais do Supabase Cloud (URL é previsível)
updateEnv('NEXT_PUBLIC_SUPABASE_URL', apiUrl);

// DATABASE_URL para Supabase Cloud (formato padrão se não estiver definido)
const dbUser = 'postgres';
const dbPass = '[SUA-SENHA-DO-BANCO]'; 
const dbHost = `db.${projectRef}.supabase.co`;
const dbPort = '5432';
const dbName = 'postgres';

const remoteDbUrl = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;

// Atualizar variáveis de banco para nuvem
updateEnv('DATABASE_URL', remoteDbUrl);
updateEnv('DIRECT_URL', remoteDbUrl);
updateEnv('POSTGRES_USER', dbUser);
updateEnv('POSTGRES_PASSWORD', dbPass);
updateEnv('POSTGRES_HOST', dbHost);
updateEnv('POSTGRES_PORT', dbPort);
updateEnv('POSTGRES_DB', dbName);

// Avisar sobre chaves que o CLI não provê para nuvem via "status"
console.log('\n⚠️  Supabase CLI "status" fornece apenas credenciais LOCAIS.');
console.log('🔗 URL Cloud configurada: ' + apiUrl);
console.log('\n🔹 Por favor, verifique se seu arquivo .env.cloud contém as chaves ANON e SERVICE_ROLE corretas.');

// Adicionar ENCRYPTION_SECRET se estiver vazio ou placeholder
const hasEncryptionSecret = envContent.match(/^ENCRYPTION_SECRET=(?!("|')?(your_32_byte_secret_here_|your_32_chars_long_encryption_secret).*("|')?).+/m);
if (!hasEncryptionSecret) {
  console.log('🔐 Gerando chave de criptografia AES-256-GCM...');
  const secret = crypto.randomBytes(32).toString('hex');
  updateEnv('ENCRYPTION_SECRET', secret);
}

// Salvar
envContent = envContent.trim() + '\n';
writeFileSync(envPath, envContent);

console.log(`\n✅ Arquivo ${envPath} preparado!`);
console.log(`🛠️  Prisma generate...`);
try {
    execSync('npx prisma generate', { stdio: 'inherit' });
} catch (e) {
    console.warn('⚠️  Prisma generate falhou (isso é esperado se você ainda não configurou a DATABASE_URL no .env.cloud).');
}

console.log('\n🎉 Setup Cloud concluído (estágio 1)!');
console.log('👉 PRÓXIMO PASSO: Edite o arquivo .env.cloud e preencha as chaves reais do seu projeto no Dashboard do Supabase.');
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   - SUPABASE_SERVICE_ROLE_KEY');
console.log('   - DATABASE_URL (incluindo sua senha)\n');
