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

// 2. Definir o arquivo de ambiente alvo
const envFile = pjEnv === 'cloud' ? '.env.cloud' : '.env';

// 3. Capturar o comando que o usuário quer rodar (ex: "next dev")
const commandArgs = process.argv.slice(2).join(' ');

if (!commandArgs) {
  console.error('❌ Nenhum comando especificado para o env-run.');
  process.exit(1);
}

// 4. Executar usando dotenv-cli para injetar as variáveis corretas
console.log(`\n\x1b[36m🚀 [Pejotinha Context: ${pjEnv.toUpperCase()}]\x1b[0m`);
console.log(`📁 Usando: ${envFile}\n`);

try {
  // Chamamos o comando original prefixado pelo dotenv-cli
  execSync(`npx dotenv-cli -e ${envFile} -- ${commandArgs}`, { stdio: 'inherit' });
} catch (error) {
  // O erro já foi impresso pelo stdio: inherit
  process.exit(1);
}
