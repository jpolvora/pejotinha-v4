import { createInterface } from 'readline';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function main() {
  console.clear();
  console.log('\x1b[36m%s\x1b[0m', '🚀 Pejotinha v4 - Assistente de Configuração');
  console.log('--------------------------------------------------');
  console.log('Escolha como deseja rodar o projeto:');
  console.log('1. \x1b[33mSelf-Hosted\x1b[0m (Local via Docker/Supabase CLI)');
  console.log('2. \x1b[35mCloud-Hosted\x1b[0m (Conectar ao Supabase Dashboard remoto)');
  console.log('--------------------------------------------------');

  const answer = await question('Escolha uma opção (1 ou 2): ');

  const envType = answer === '1' ? 'local' : 'cloud';
  writeFileSync('.env.local', `PJ_ENV=${envType}\n`);
  console.log(`📍 Configuração salva: \x1b[36m${envType}\x1b[0m em .env.local\n`);

  if (answer === '1') {
    console.log('\n📦 \x1b[33mIniciando setup Self-Hosted (Local)...\x1b[0m');
    
    try {
      console.log('🛠️  Configurando variáveis de ambiente e subindo containers...');
      execSync('node scripts/setup-env.mjs .env', { stdio: 'inherit' });
      
      console.log('🔄 Sincronizando schema com o banco local...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      
      console.log('🔐 Sincronizando usuários padrão no Auth...');
      execSync('node scripts/sync-auth.mjs', { stdio: 'inherit' });
      
      console.log('🌱 Populando dados de teste (Seed)...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
      
      console.log('🛠️  Aplicando regras de segurança SQL (RLS/Triggers)...');
      execSync('npm run db:setup-supabase', { stdio: 'inherit' });

      console.log('\n\x1b[32m%s\x1b[0m', '✅ Setup Local concluído com sucesso!');
      console.log('Para iniciar o app: \x1b[34m%s\x1b[0m', 'npm run dev');
    } catch (error) {
      console.error('\n\x1b[31m%s\x1b[0m', '❌ Falha no setup local. Verifique se o Docker está rodando.');
    }
  } 
  else if (answer === '2') {
    console.log('\n☁️  \x1b[35mIniciando setup Cloud-Hosted (Supabase.com)...\x1b[0m');
    
    try {
      console.log('🛠️  Preparando arquivo .env.cloud...');
      execSync('node scripts/setup-cloud.mjs', { stdio: 'inherit' });

      console.log('\n\x1b[32m%s\x1b[0m', '✅ Arquivo .env.cloud gerado com sucesso!');
      console.log('--------------------------------------------------');
      console.log('\x1b[31m%s\x1b[0m', '⚠️  AÇÃO REQUERIDA:');
      console.log('1. Abra o arquivo .env.cloud');
      console.log('2. Preencha as credenciais reais do seu Dashboard do Supabase');
      console.log('3. Após preencher, execute:');
      console.log('   \x1b[34m%s\x1b[0m', 'npm run db:push');
      console.log('4. Depois inicie o app com:');
      console.log('   \x1b[34m%s\x1b[0m', 'npm run dev');
      console.log('--------------------------------------------------');
    } catch (error) {
      console.error('\n\x1b[31m%s\x1b[0m', '❌ Falha ao inicializar o setup de nuvem.');
    }
  } 
  else {
    console.log('\x1b[31m%s\x1b[0m', 'Opção inválida. Setup encerrado.');
  }

  rl.close();
}

main();
