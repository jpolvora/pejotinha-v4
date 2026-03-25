# 🚀 Pejotinha v4 - Freelancer Dashboard & Proof of Work

Pejotinha é uma plataforma SaaS multiusuário voltada para freelancers que desejam profissionalizar sua gestão de tempo, gastos e comprovação de trabalho. Focado em **Experiência do Usuário Premium** e **Segurança**, o sistema oferece uma timeline integrada de atividades, gestão de clientes e ferramentas de IA para automação de logs.

---

## 🛠️ Tecnologias
- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Lucide React, Shadcn/UI.
- **Backend / BaaS**: Supabase (Self-hosted ou Cloud) - Auth, Storage, Edge Functions.
- **ORM**: Prisma (PostgreSQL).
- **IA**: Vercel AI SDK (Google Gemini / OpenAI).
- **Infra**: Docker Multi-stage (Development & Runner).

---

## 🏗️ Arquitetura Self-Hosted
Este projeto foi desenhado para ser totalmente independente. Diferente de outros SaaS que exigem contas pagas em serviços de nuvem, o Pejotinha permite que você rode **sua própria stack do Supabase** localmente ou em seu servidor através do **Supabase CLI**.

---

## 🚀 Como Começar (Setup Rápido)

### 📋 Pré-requisitos
Para rodar este projeto localmente, você precisará de:

- **Git**: Para clonar o repositório.
- **Terminal**: Utilizar Bash ou CMD (Git Bash é altamente recomendado no Windows).
- **Docker / Docker Desktop**: Para rodar o container do Supabase e o banco de dados.
- **Node.js**: Versão 20 ou superior.
- **NVM for Windows (Opcional)**: Recomendado para gerenciar múltiplas versões do Node.js.
- **NPM**: Gerenciador de pacotes (instalado com o Node).

---

### 🛠️ Passo a Passo

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/jpolvora/pejotinha-v4.git
   cd pejotinha-v4
   ```

2. **Execute o Setup Automatizado**:
   ```bash
   npm run setup
   ```
   *Este comando configura o .env, sobe o Supabase local, sincroniza o banco e as permissões de acesso.*

3. **Inicie o Ambiente de Desenvolvimento**:
   ```bash
   npm run dev
   ```

---

## 📸 Screenshots

### Dashboard Desktop
![Dashboard](public/screenshots/dashboard.png)

### Access Control (Login)
![Login](public/screenshots/login.png)

### Project Management
![Projects](public/screenshots/projects.png)

### Project Details & Timeline
![Project Details](public/screenshots/project_details.png)

### Log New Activity (IA Assisted)
![Log Activity](public/screenshots/log_activity.png)

### Client Management
![Clients](public/screenshots/clients.png)

---

4. **Pare o Ambiente Local**:
   ```bash
   npm run stop
   ```

5. **Acesse as ferramentas**:
   - **Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Supabase Studio (Painel Admin)**: [http://localhost:54323](http://localhost:54323)
   - **Mailpit (Inbucket)**: [http://localhost:54324](http://localhost:54324)

---

## 🔑 Acesso Padrão (Seed)
Após o setup, o banco de dados virá populado com os seguintes dados de teste:

- **Admin**: `admin@email.com` / `P@ssword!`
- **Freelancer Teste**: `freelancer@pejotinha.dev` / `P@ssword!`

---

## 📦 Deploy em Produção (Coolify / Umbrel / Portainer)

Para faturar a imagem otimizada para o seu servidor:

1. **Configure o seu Registro**:
   Edite o `deploy.sh` e coloque o seu `USERNAME` do GitHub (ou outro registro).

2. **Execute o Deploy**:
   ```bash
   npm run deploy
   ```
   *Isso irá construir o container em modo standalone e subir para o GHCR.*

---

## 🛡️ Segurança e Desenvolvimento (CI/CD Local)
Este projeto utiliza **Husky**, **Lint-Staged** e **Secretlint** para garantir a qualidade e segurança do código.
- **Pré-commit**: Toda tentativa de commit irá rodar uma verificação de segurança automática para impedir que credenciais (API Keys, Secrets) sejam vazadas no repositório.

3. **No seu Servidor**:
   - Utilize a imagem gerada (ex: `ghcr.io/seu-usuario/pejotinha-v4:latest`).
   - Certifique-se de configurar as variáveis de ambiente (`.env`) no seu orquestrador (Coolify/Umbrel) apontando para sua instância do Supabase.

---

## 🔐 Segurança e Criptografia
Para proteger as credenciais de integração dos usuários (Tokens de Telegram, API Keys), o Pejotinha utiliza criptografia **AES-256-GCM**.
- O segredo de criptografia é gerado automaticamente no arquivo `.env` durante o setup (`ENCRYPTION_SECRET`).
- **IMPORTANTE**: Nunca perca este segredo em produção, ou os dados criptografados serão ilegíveis.

---

## 🤝 Contribuição
1. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`).
2. Commit suas mudanças (`git commit -m 'Add nova feature'`).
3. Push para a branch (`git push origin feature/nova-feature`).
4. Abra um Pull Request.

---

## 📄 Licença
Desenvolvido por **Jone Polvora**. Este projeto é focado em produtividade para a comunidade freelancer.