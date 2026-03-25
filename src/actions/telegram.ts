'use server'

import prisma from '@/lib/prisma'
import { extractTaskOrActivityPayload } from './ai'
import { createTask, createBatchTasks } from './tasks'
import { createActivity } from './activities'

export async function handleTelegramMessage(chatId: string, text: string) {
  // 1. Find user by chatId in settings JSON
  // Enhanced: Use direct query for performance and security.
  // Note: For large scale, a dedicated indexed column 'telegram_chat_id' is mandatory.
  const profile = await prisma.profile.findFirst({
    where: {
      settings: {
        path: ['telegramConfig', 'chatId'],
        equals: chatId.toString()
      }
    }
  });

  if (!profile) {
    return "Ops! Não encontrei sua conta no Pejotinha. Por favor, configure seu Telegram ID nas configurações do dashboard.";
  }

  try {
    const result = await extractTaskOrActivityPayload(text, new Date().toISOString());

    if (!result.success || result.intent === 'UNKNOWN') {
      return "Não consegui entender seu comando. Tente algo como 'Criar tarefa: Ajustar botões' ou 'Logar 2h no projeto X'.";
    }

    // Identify which project to use. 
    // Logic: Use the most recently active project or require project name in text?
    // For MVP: Use the most recent project the user worked on.
    const lastProject = await prisma.project.findFirst({
      where: { freelancerId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!lastProject) {
      return "Você ainda não tem projetos criados. Crie um projeto no dashboard primeiro.";
    }

    if (result.intent === 'CREATE_TASK') {
       await prisma.task.create({
         data: {
           projectId: lastProject.id,
           name: result.data.description || "Nova Tarefa via Telegram",
           description: result.data.executionPlan,
           dueDate: result.data.dueDate ? new Date(result.data.dueDate) : null,
           status: 'pending'
         }
       });
       return `✅ Tarefa criada com sucesso no projeto *${lastProject.name}*: ${result.data.description}`;
    }

    if (result.intent === 'LOG_ACTIVITY') {
       // Mocking FormData for existing createActivity action if possible, 
       // or just direct prisma call.
       const durationMinutes = result.data.durationMinutes || 0;
       const hourlyRate = Number(lastProject.hourly_rate) || 0;
       const value = (durationMinutes / 60) * hourlyRate;

       await prisma.activity.create({
         data: {
           projectId: lastProject.id,
           description: result.data.description || "Atividade via Telegram",
           durationMinutes,
           startTime: result.data.startTime ? new Date(result.data.startTime) : null,
           endTime: result.data.endTime ? new Date(result.data.endTime) : null,
           sprint: result.data.sprint,
           ticket: result.data.ticket,
           value
         }
       });
       return `✅ Atividade registrada no projeto *${lastProject.name}* (${durationMinutes} min): ${result.data.description}`;
    }

    return "Processado, mas nada foi criado.";
  } catch (error) {
    console.error("Erro no processamento Telegram:", error);
    return "Erro interno ao processar sua mensagem. Tente novamente mais tarde.";
  }
}
