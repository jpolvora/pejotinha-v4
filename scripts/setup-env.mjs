import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import crypto from 'crypto';

console.log('🚀 Finalizando configuração do ambiente Supabase...\n');

let statusOutput = '';

// 1. Iniciar Supabase (checar se já está rodando primeiro)
try {
  console.log('🔍 Checando status do Supabase...');
  // Tentar obter status em formato JSON usando a versão local instalada
  statusOutput = execSync('npx --no-install supabase status -o json', { encoding: 'utf-8' });
  console.log('✅ Supabase já está em execução.');
} catch (e) {
  console.log('📦 Supabase não detectado ou parado. Subindo containers...');
  try {
    // Tenta iniciar (usa npx sem --no-install se precisar baixar, mas npm run setup já instalou)
    execSync('npx supabase start', { stdio: 'inherit' });
    // Tenta obter status novamente
    statusOutput = execSync('npx --no-install supabase status -o json', { encoding: 'utf-8' });
    console.log('✅ Supabase iniciado com sucesso.');
  } catch (startError) {
    console.error('❌ Erro ao iniciar o Supabase. Verifique se o Docker está rodando.');
    process.exit(1);
  }
}

// 2. Extrair Credenciais do JSON
console.log('🔍 Capturando credenciais do Supabase...');
let status;
try {
  status = JSON.parse(statusOutput);
} catch (parseError) {
  console.error('❌ Erro ao processar saída JSON do Supabase.');
  console.log('Saída bruta:\n', statusOutput);
  process.exit(1);
}

const apiUrl = status.API_URL || status.Project_URL;
const anonKey = status.PUBLISHABLE_KEY || status.ANON_KEY;
const serviceKey = status.SECRET_KEY || status.SERVICE_ROLE_KEY;
const dbUrl = status.DB_URL;

if (apiUrl && anonKey) {

  const envPath = process.argv[2] || '.env';
  let envContent = '';

  // Usar .env.example como base se o .env não existir
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
  } else if (existsSync('.env.example')) {
    console.log(`📄 Criando ${envPath} baseado no .env.example...`);
    envContent = readFileSync('.env.example', 'utf8');
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

  // Preencher credenciais do Supabase
  updateEnv('NEXT_PUBLIC_SUPABASE_URL', apiUrl);
  updateEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', anonKey);
  updateEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY', anonKey);
  updateEnv('SUPABASE_SERVICE_ROLE_KEY', serviceKey);
  updateEnv('DATABASE_URL', dbUrl);
  updateEnv('DIRECT_URL', dbUrl); // No local, costumam ser iguais

  // Parsear componentes do Postgres
  if (dbUrl) {
    const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (urlParts) {
      updateEnv('POSTGRES_USER', urlParts[1]);
      updateEnv('POSTGRES_PASSWORD', urlParts[2]);
      updateEnv('POSTGRES_HOST', urlParts[3]);
      updateEnv('POSTGRES_PORT', urlParts[4]);
      updateEnv('POSTGRES_DB', urlParts[5]);
    }
  }

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

  console.log(`\n✅ Arquivo ${envPath} atualizado com sucesso!`);
  console.log(`🔗 URL: ${apiUrl}`);
  console.log(`🔑 Anon Key: ${anonKey.substring(0, 15)}...`);
  console.log(`🛠️  Banco: ${dbUrl}`);
} else {
  console.error('❌ Não foi possível extrair as chaves da saída do Supabase.');
  console.log('Saída bruta:\n', statusOutput);
  process.exit(1);
}
