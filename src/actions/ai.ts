'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { getSettings } from './settings'

export type AIIntent = 'LOG_ACTIVITY' | 'CREATE_TASK' | 'UNKNOWN';

async function getAIModel(preferredModel?: string) {
  const settings = await getSettings()
  
  if (!settings?.aiConfig?.apiKey) {
    throw new Error('Chave de API da IA não configurada. Vá para Configurações.')
  }

  const { apiKey, baseUrl, model, provider } = settings.aiConfig!

  let aiModel;
  
  // Decide which SDK to use based on provider and URL
  if (provider === 'gemini' && !baseUrl?.includes('/openai')) {
    // Native Google SDK
    const google = createGoogleGenerativeAI({
      apiKey,
      baseURL: baseUrl,
    })
    aiModel = google(preferredModel || model || 'gemini-3-flash')
  } else if (provider === 'anthropic') {
    // Anthropic SDK
    const anthropic = createAnthropic({
      apiKey,
      baseURL: baseUrl || undefined,
    })
    aiModel = anthropic(preferredModel || model)
  } else {
    // OpenAI Compatible SDK (OpenAI, Groq, Mistral, DeepSeek, Google-OpenAI-Shim, etc.)
    const openai = createOpenAI({
      apiKey,
      baseURL: baseUrl,
    })
    aiModel = openai.chat(preferredModel || model)
  }

  return aiModel
}

export async function extractTaskOrActivityPayload(text: string, currentTimeIso: string) {
  const aiModel = await getAIModel()

  try {
    const { text: resultText } = await generateText({
      model: aiModel,
      prompt: `Baseado no momento atual (${currentTimeIso}), analise a mensagem de texto abaixo e identifique a intenção do usuário:
1. "LOG_ACTIVITY": Registrar tempo trabalhado em algo já feito (passado). Requer descrição e duração ou horários.
2. "CREATE_TASK": Criar uma nova tarefa para ser feita (futuro). Requer título/descrição e opcionalmente prazo.

Texto do usuário:
"${text}"

Instruções importantes:
- Calcule datas/horas relativas a ${currentTimeIso}.
- Retorne nulo nos campos que não conseguir identificar com certeza.
- durationMinutes é sempre um número inteiro.
- Importante: Retorne APENAS o JSON puro, sem blocos de código ou explicações.

Estrutura esperada:
{
  "intent": "LOG_ACTIVITY" | "CREATE_TASK" | "UNKNOWN",
  "data": {
    "description": string (título da tarefa ou descrição da atividade),
    "durationMinutes": number | null (apenas para LOG_ACTIVITY),
    "startTime": string (ISO) | null (apenas para LOG_ACTIVITY),
    "endTime": string (ISO) | null (apenas para LOG_ACTIVITY),
    "dueDate": string (ISO) | null (apenas para CREATE_TASK),
    "sprint": string | null,
    "ticket": string | null,
    "executionPlan": string | null
  }
}
`,
    })

    const cleanedText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedText);

    return { success: true, intent: result.intent as AIIntent, data: result.data }
  } catch (error: any) {
    console.error('Erro ao gerar com IA:', error)
    return { success: false, error: error.message || 'Falha ao comunicar com a IA.' }
  }
}

// Keep the old function for backward compatibility or refactor existing calls
export async function extractActivityPayload(text: string, currentTimeIso: string) {
  const result = await extractTaskOrActivityPayload(text, currentTimeIso);
  if (!result.success) return result;
  return { success: true, data: result.data };
}

export async function summarizeWorkEvents(events: string[]) {
  try {
    const aiModel = await getAIModel('gemini-3-flash');

    const { text: summary } = await generateText({
      model: aiModel,
      prompt: `Abaixo está uma lista de eventos brutos (mensagens de commit, logs de atividade, PRs) de um dia de trabalho de um desenvolvedor.
      Combine-os em um parágrafo profissional e legível que descreva o progresso feito, adequado para ser enviado a um cliente.
      
      Regras:
      - Seja profissional mas direto.
      - Use a primeira pessoa do plural ou do singular (ex: "Trabalhei em..." ou "Finalizamos...").
      - Máximo de 3-4 frases.
      - Idioma: Português do Brasil.
      
      Eventos:
      ${events.join('\n- ')}
      `,
    });

    return { success: true, summary };
  } catch (error: any) {
    console.error('Erro ao resumir com IA:', error);
    return { success: false, error: error.message };
  }
}

export async function generateNarrativeSummary(activities: { source?: string, description: string, startTime?: Date | null }[]) {
  if (activities.length === 0) return { success: true, summary: '' }

  try {
    const aiModel = await getAIModel()

    const activityList = activities.map(a => {
      const time = a.startTime ? new Date(a.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
      return `- ${time ? `[${time}] ` : ''}${a.source === 'git' ? 'commit: ' : ''}${a.description}`
    }).join('\n')

    const { text: summary } = await generateText({
      model: aiModel,
      prompt: `Baseado na lista de atividades abaixo, gere um resumo narrativo profissional em português para um relatório de cliente. 
O resumo deve ser conciso (um parágrafo ou poucos marcadores), focado em resultados e conquistas, e omitir detalhes técnicos irrelevantes (como hashes de commit ou nomes de arquivos específicos se não agregarem valor).

Atividades:
${activityList}

Instruções:
- Retorne apenas o texto do resumo, sem introduções, conclusões ou formatação markdown excessiva.
- Se houver horários, tente agrupar atividades relacionadas cronologicamente.
- O tom deve ser profissional, direto e proativo.
`
    })

    return { success: true, summary }
  } catch (error: any) {
    console.error('Erro ao gerar narrativa:', error)
    return { success: false, error: error.message || 'Falha ao comunicar com a IA.' }
  }
}
