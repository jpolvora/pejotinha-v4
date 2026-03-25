'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { getSettings } from './settings'

export type AIIntent = 'LOG_ACTIVITY' | 'CREATE_TASK' | 'UNKNOWN';

export async function extractTaskOrActivityPayload(text: string, currentTimeIso: string) {
  const settings = await getSettings()
  
  if (!settings?.aiConfig?.apiKey) {
    throw new Error('Chave de API da IA não configurada. Vá para Configurações.')
  }

  const { apiKey, baseUrl, model, provider } = settings.aiConfig!

  let aiModel;
  
  // Choose the right provider based on config
  // Check if it's a Google host but NOT explicitly forced to OpenAI shim by user configuration (unless provider is gemini)
  const isGoogleHost = baseUrl && baseUrl.includes('generativelanguage.googleapis.com');
  const isNativeGoogle = provider === 'gemini' || (isGoogleHost && !baseUrl.includes('/openai'));

  if (isNativeGoogle || isGoogleHost) {
    // Determine the best version: models like 1.5 often require v1beta, 
    // while Gemini 2.5/3.1 are stable in v1.
    const isLegacyModel = model && (model.includes('1.5') || model.includes('1.0'));
    
    const google = createGoogleGenerativeAI({
      apiKey,
      // If user provided a custom google URL, use it. 
      // Otherwise, let the SDK use its default stable/beta logic.
      baseURL: isGoogleHost && baseUrl.includes('/openai') 
        ? baseUrl.split('/openai')[0] 
        : (isGoogleHost && isLegacyModel && baseUrl.includes('/v1') ? baseUrl.replace('/v1', '/v1beta') : baseUrl),
    })
    aiModel = google(model || 'gemini-3.1-flash-lite')
  } else {
    const aiProvider = createOpenAI({
      apiKey,
      baseURL: baseUrl,
    })
    // For standard OpenAI-compatible providers, use the chat completions endpoint
    aiModel = aiProvider.chat(model || 'gpt-5.4-mini')
  }

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
