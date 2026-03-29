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
      rl.close();
      return;
    }

    // Google Auth Configuration
    console.log('\n--------------------------------------------------');
    console.log('\x1b[36m%s\x1b[0m', '🔒 Configuração de Autenticação via Google');
    console.log('1. \x1b[32mHabilitar\x1b[0m Google Login');
    console.log('2. \x1b[31mDesabilitar\x1b[0m Google Login');
    console.log('--------------------------------------------------');
    const googleChoice = await question('Escolha uma opção (1 ou 2): ');

    if (googleChoice === '1') {
      const clientId = await question('Google Client ID: ');
      const clientSecret = await question('Google Client Secret: ');
      
      const envFile = answer === '1' ? '.env' : '.env.cloud';
      const existingEnv = readFileSync(envFile, 'utf8');
      
      // Update or Append Google Auth Vars
      let newEnv = existingEnv;
      const updateVar = (key, value) => {
        if (newEnv.includes(key)) {
          newEnv = newEnv.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
        } else {
          newEnv += `\n${key}=${value}`;
        }
      };

      updateVar('GOOGLE_CLIENT_ID', clientId);
      updateVar('GOOGLE_CLIENT_SECRET', clientSecret);
      updateVar('NEXT_PUBLIC_GOOGLE_AUTH_ENABLED', 'true');
      
      writeFileSync(envFile, newEnv);
      console.log('\x1b[32m%s\x1b[0m', '✅ Google Auth configurado com sucesso!');
    } else {
      const envFile = answer === '1' ? '.env' : '.env.cloud';
      const existingEnv = readFileSync(envFile, 'utf8');
      let newEnv = existingEnv.replace(/NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true/g, 'NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=false');
      if (!newEnv.includes('NEXT_PUBLIC_GOOGLE_AUTH_ENABLED')) {
        newEnv += '\nNEXT_PUBLIC_GOOGLE_AUTH_ENABLED=false';
      }
      writeFileSync(envFile, newEnv);
      console.log('\x1b[33m%s\x1b[0m', 'ℹ️  Google Auth desabilitado.');
    }

    rl.close();
  }

main();
