import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * IMPORTANT: This seed script populates only `public` schema tables.
 * Auth users must already exist in Supabase (auth.users).
 *
 * Before running, set SEED_USER_ID env var to a valid auth.users UUID,
 * or use the fallback ID below (must exist in your Supabase instance).
 */

const FREELANCER_ID = process.env.SEED_USER_ID || '00000000-0000-0000-0000-000000000001'
const ADMIN_ID = '00000000-0000-0000-0000-00000000a000'

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create Admin Profile
  const adminProfile = await prisma.profile.upsert({
    where: { id: ADMIN_ID },
    update: {},
    create: {
      id: ADMIN_ID,
      email: 'admin@email.com',
      fullName: 'Administrador do Sistema',
      role: 'freelancer', // Assuming all admin capabilities are within the freelancer role for now
    },
  })
  console.log(`✅ Admin Profile: ${adminProfile.fullName}`)

  // 2. Upsert (or ensure) the default test freelancer
  const profile = await prisma.profile.upsert({
    where: { id: FREELANCER_ID },
    update: {},
    create: {
      id: FREELANCER_ID,
      email: 'freelancer@pejotinha.dev',
      fullName: 'João Silva',
      role: 'freelancer',
    },
  })
  console.log(`✅ Test Freelancer: ${profile.fullName}`)

  // 2. Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        freelancerId: FREELANCER_ID,
        name: 'TechCorp Brasil',
        email: 'contato@techcorp.com.br',
        hourlyRate: 150.00,
      },
    }),
    prisma.customer.create({
      data: {
        freelancerId: FREELANCER_ID,
        name: 'StartupXYZ',
        email: 'hello@startupxyz.io',
        hourlyRate: 120.00,
      },
    }),
    prisma.customer.create({
      data: {
        freelancerId: FREELANCER_ID,
        name: 'AgênciaDigital',
        email: 'projetos@agenciadigital.com.br',
        hourlyRate: 180.00,
      },
    }),
  ])
  console.log(`✅ Customers: ${customers.length} created`)

  // 3. Create Projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        freelancerId: FREELANCER_ID,
        customerId: customers[0].id,
        name: 'Dashboard Analytics',
        description: 'Dashboard de analytics com gráficos interativos e relatórios em tempo real',
        status: 'active',
        hourly_rate: 150.00,
        tech_stacks: ['Next.js', 'TypeScript', 'Recharts', 'Prisma'],
      },
    }),
    prisma.project.create({
      data: {
        freelancerId: FREELANCER_ID,
        customerId: customers[0].id,
        name: 'API de Pagamentos',
        description: 'Integração com gateways de pagamento e sistema de cobranças recorrentes',
        status: 'active',
        hourly_rate: 160.00,
        tech_stacks: ['Node.js', 'Stripe', 'PostgreSQL'],
      },
    }),
    prisma.project.create({
      data: {
        freelancerId: FREELANCER_ID,
        customerId: customers[1].id,
        name: 'Landing Page MVP',
        description: 'Landing page com formulário de leads e integração com CRM',
        status: 'completed',
        hourly_rate: 120.00,
        tech_stacks: ['Next.js', 'Tailwind CSS'],
      },
    }),
    prisma.project.create({
      data: {
        freelancerId: FREELANCER_ID,
        customerId: customers[1].id,
        name: 'App Mobile',
        description: 'Aplicativo mobile para gestão de tarefas com notificações push',
        status: 'active',
        hourly_rate: 140.00,
        tech_stacks: ['React Native', 'Expo', 'Firebase'],
      },
    }),
    prisma.project.create({
      data: {
        freelancerId: FREELANCER_ID,
        customerId: customers[2].id,
        name: 'E-commerce Redesign',
        description: 'Redesign completo da loja online com foco em conversão e UX',
        status: 'completed',
        hourly_rate: 180.00,
        tech_stacks: ['Next.js', 'Shopify', 'Tailwind CSS'],
      },
    }),
  ])
  console.log(`✅ Projects: ${projects.length} created`)

  // 4. Create Activities (time entries)
  const now = new Date()
  const activities = await Promise.all([
    // Today's work
    prisma.activity.create({
      data: {
        projectId: projects[0].id,
        description: 'Implementação dos componentes de gráfico de barras',
        executionPlan: 'Usar Recharts com dados do Prisma, criar componente reutilizável',
        durationMinutes: 120,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0),
        sprint: 'Sprint 3',
        ticket: 'DASH-042',
        value: 300.00,
      },
    }),
    prisma.activity.create({
      data: {
        projectId: projects[0].id,
        description: 'Code review e correção de bugs no filtro de datas',
        durationMinutes: 60,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0),
        sprint: 'Sprint 3',
        ticket: 'DASH-039',
        value: 150.00,
      },
    }),
    // Yesterday
    prisma.activity.create({
      data: {
        projectId: projects[1].id,
        description: 'Configuração do webhook do Stripe e testes de integração',
        executionPlan: 'Configurar endpoint, validar assinatura, processar eventos',
        durationMinutes: 180,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 13, 0),
        sprint: 'Sprint 2',
        ticket: 'PAY-015',
        value: 480.00,
      },
    }),
    prisma.activity.create({
      data: {
        projectId: projects[3].id,
        description: 'Tela de onboarding com animações Lottie',
        durationMinutes: 150,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 16, 30),
        value: 350.00,
      },
    }),
    // 2 days ago
    prisma.activity.create({
      data: {
        projectId: projects[0].id,
        description: 'Design system: tokens de cor e componentes base',
        durationMinutes: 240,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 9, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 13, 0),
        sprint: 'Sprint 3',
        ticket: 'DASH-035',
        value: 600.00,
      },
    }),
    // 3 days ago
    prisma.activity.create({
      data: {
        projectId: projects[1].id,
        description: 'Modelagem do banco para planos de assinatura',
        durationMinutes: 90,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 11, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 12, 30),
        sprint: 'Sprint 2',
        ticket: 'PAY-012',
        value: 240.00,
      },
    }),
    // Completed project activities
    prisma.activity.create({
      data: {
        projectId: projects[2].id,
        description: 'Entrega final da landing page com testes A/B configurados',
        durationMinutes: 180,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 9, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 12, 0),
        value: 360.00,
      },
    }),
    prisma.activity.create({
      data: {
        projectId: projects[4].id,
        description: 'Deploy final do redesign e handoff para equipe do cliente',
        durationMinutes: 120,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10, 14, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10, 16, 0),
        value: 360.00,
      },
    }),
  ])
  console.log(`✅ Activities: ${activities.length} created`)

  // 5. Create Invoices
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        freelancerId: FREELANCER_ID,
        customerId: customers[0].id,
        projectId: projects[0].id,
        amount: 4500.00,
        currency: 'BRL',
        status: 'sent',
        description: 'Sprint 3 - Dashboard Analytics - Março 2026',
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
        periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
        periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      },
    }),
    prisma.invoice.create({
      data: {
        freelancerId: FREELANCER_ID,
        customerId: customers[1].id,
        projectId: projects[2].id,
        amount: 2160.00,
        currency: 'BRL',
        status: 'paid',
        description: 'Landing Page MVP - Entrega Final',
        paidAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
        periodStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        periodEnd: new Date(now.getFullYear(), now.getMonth(), 0),
      },
    }),
    prisma.invoice.create({
      data: {
        freelancerId: FREELANCER_ID,
        customerId: customers[2].id,
        projectId: projects[4].id,
        amount: 8640.00,
        currency: 'BRL',
        status: 'paid',
        description: 'E-commerce Redesign - Projeto Completo',
        paidAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8),
        periodStart: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        periodEnd: new Date(now.getFullYear(), now.getMonth() - 1, 0),
      },
    }),
  ])
  console.log(`✅ Invoices: ${invoices.length} created`)

  // 6. Create sample personal events
  await Promise.all([
    prisma.personalEvent.create({
      data: {
        freelancerId: FREELANCER_ID,
        title: 'Consulta médica',
        description: 'Check-up anual',
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 8, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 30),
      },
    }),
    prisma.personalEvent.create({
      data: {
        freelancerId: FREELANCER_ID,
        title: 'Almoço de networking',
        description: 'Encontro com potenciais clientes no coworking',
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 30),
      },
    }),
  ])
  console.log(`✅ Personal events created`)

  console.log('\n🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
