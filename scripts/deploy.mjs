import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

// 1. Ler a configuração do .env.local
let pjEnv = 'local';
if (existsSync('.env.local')) {
  const envLocal = readFileSync('.env.local', 'utf8');
  const match = envLocal.match(/^PJ_ENV=(local|cloud)/m);
  if (match) {
    pjEnv = match[1];
  }
}

// 2. Definir o fluxo de deploy baseado no ambiente
console.clear();
console.log(`\n\x1b[36m🚀 [Pejotinha Context: ${pjEnv.toUpperCase()}]\x1b[0m`);

try {
  if (pjEnv === 'cloud') {
    console.log('📡 1. Sincronizando infraestrutura remota (Supabase Cloud)...');
    execSync('sh scripts/deploy-cloud.sh', { stdio: 'inherit' });
    
    console.log('\n🏗️  2. Iniciando build do container Docker conectado ao remoto...');
    execSync('sh deploy.sh', { stdio: 'inherit' });
  } else {
    console.log('📦 Iniciando build do container Docker para Self-Hosted (Local)...');
    execSync('sh deploy.sh', { stdio: 'inherit' });
  }
} catch (error) {
  // O erro já foi impresso pelo stdio: inherit
  process.exit(1);
}
