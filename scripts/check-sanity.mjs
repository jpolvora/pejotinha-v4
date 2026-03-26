import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { existsSync } from 'fs';

dotenv.config();

console.log('🧐 Iniciando verificação de sanidade do sistema...\n');

async function checkSanity() {
  const errors = [];

  // 1. Verificar .env
  if (existsSync('.env')) {
    console.log('✅ Arquivo .env encontrado.');
  } else {
    console.warn('⚠️ Arquivo .env não encontrado. Rodando em ambiente de fallback?');
    // Não encerra aqui, pode estar usando env vars globais
  }

  // 2. Conexão com o Banco de Dados (PostgreSQL)
  const prisma = new PrismaClient({
    log: ['error'],
  });

  try {
    process.stdout.write('🔍 Testando conexão com PostgreSQL (via Prisma)... ');
    await prisma.$connect();
    // Teste de query simples
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conectado!');
  } catch (err) {
    console.log('❌ Falha na conexão!');
    errors.push(`Banco de Dados: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }

  // 3. Conexão com Supabase API
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  try {
    process.stdout.write(`🔍 Testando Supabase API em ${supabaseUrl}... `);
    const response = await fetch(supabaseUrl, { method: 'GET' });
    if (response.ok || response.status === 401 || response.status === 403 || response.status === 404) {
      // Diferentes status podem ser "ok" para um ping básico
      console.log('✅ Acessível!');
    } else {
      console.log(`⚠️ Status inesperado: ${response.status}`);
    }
  } catch (err) {
    console.log('❌ Inacessível!');
    errors.push(`Supabase API: ${err.message}`);
  }

  // Resumo Final
  console.log('\n--------------------------------------------------');
  if (errors.length === 0) {
    console.log('🎉 Tudo certo! O sistema está pronto para desenvolvimento.');
    process.exit(0);
  } else {
    console.log('❌ Ocorreram falhas durante a verificação:');
    errors.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
    console.log('--------------------------------------------------');
    console.log('💡 Dica: Rode "npm run setup" se for um novo ambiente.');
    process.exit(1);
  }
}

checkSanity();
