import {
  BedrockRuntimeClient,
  ConverseCommand,
  InvokeModelCommand,
  type Message,
} from '@aws-sdk/client-bedrock-runtime'

/**
 * Claude on Amazon Bedrock through the India inference profile, so processing stays in Mumbai and
 * Hyderabad. Model IDs are env-driven: the architecture starts on Haiku 4.5 for everything; switch
 * BEDROCK_MODEL_ANSWER to in.anthropic.claude-sonnet-5 for higher-quality customer answers.
 */
export const MODELS = {
  classify: process.env.BEDROCK_MODEL_CLASSIFY || 'in.anthropic.claude-haiku-4-5-20251001-v1:0',
  answer: process.env.BEDROCK_MODEL_ANSWER || 'in.anthropic.claude-haiku-4-5-20251001-v1:0',
  embed: process.env.BEDROCK_MODEL_EMBED || 'amazon.titan-embed-text-v2:0',
}

const hasCreds = Boolean(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE || process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI)
export const AI_MODE: 'live' | 'mock' = (process.env.AI_MODE as 'live' | 'mock') || (hasCreds ? 'live' : 'mock')

let client: BedrockRuntimeClient | null = null
export function bedrock(): BedrockRuntimeClient {
  client = client || new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'ap-south-1' })
  return client
}

export type ChatTurn = { role: 'user' | 'assistant'; text: string }

export async function converse(opts: {
  model: string
  system: string
  turns: ChatTurn[]
  maxTokens?: number
  temperature?: number
}): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const messages: Message[] = opts.turns.map((t) => ({ role: t.role, content: [{ text: t.text }] }))
  const res = await bedrock().send(
    new ConverseCommand({
      modelId: opts.model,
      system: [{ text: opts.system }],
      messages,
      inferenceConfig: { maxTokens: opts.maxTokens ?? 700, temperature: opts.temperature ?? 0.2 },
    }),
  )
  const text = res.output?.message?.content?.map((c) => c.text || '').join('') || ''
  return { text, inputTokens: res.usage?.inputTokens || 0, outputTokens: res.usage?.outputTokens || 0 }
}

export async function invokeJson<T>(model: string, body: unknown): Promise<T> {
  const res = await bedrock().send(
    new InvokeModelCommand({
      modelId: model,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    }),
  )
  return JSON.parse(new TextDecoder().decode(res.body)) as T
}

/** Rough token estimate for budget tracking when usage is not reported (mock mode). */
export const estimateTokens = (text: string) => Math.ceil((text || '').length / 4)
