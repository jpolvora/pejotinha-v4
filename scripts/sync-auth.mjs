import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const envFile = process.env.ENV_FILE || '.env';
dotenv.config({ path: envFile });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não encontradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const USERS = [
  {
    id: '00000000-0000-0000-0000-00000000a000',
    email: 'admin@email.com',
    password: 'P@ssword!',
  },
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'freelancer@pejotinha.dev',
    password: 'P@ssword!',
  }
];

async function syncUsers() {
  console.log('🔑 Sincronizando usuários no Supabase Auth...');

  for (const user of USERS) {
    try {
      const { data: existingUser } = await supabase.auth.admin.getUserById(user.id);
      
      if (existingUser?.user) {
        console.log(`✅ Usuário ${user.email} já existe.`);
      } else {
        const { error } = await supabase.auth.admin.createUser({
          id: user.id,
          email: user.email,
          password: user.password,
          email_confirm: true
        });

        if (error) {
          console.error(`❌ Erro ao criar ${user.email}:`, error.message);
        } else {
          console.log(`🆕 Usuário ${user.email} criado com sucesso.`);
        }
      }
    } catch (err) {
      console.error(`❌ Erro inesperado ao processar ${user.email}:`, err);
    }
  }
}

syncUsers();
