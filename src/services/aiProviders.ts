import { DEFAULT_MODELS, type ProviderKey } from '../utils/constants'

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

type Provider = {
  endpoint: string
  models: string[]
  headers: (apiKey: string) => Record<string, string>
  formatRequest: (messages: ChatMessage[], model: string, options: { stream?: boolean; temperature?: number; max_tokens?: number }) => any
  parseChunk?: (text: string) => string | null
  parseResponse: (json: any) => string
  supportsStream?: boolean
}

export const providers: Record<ProviderKey, Provider> = {
  closerouter: {
    endpoint: 'https://api.closerouter.com/v1/chat/completions',
    models: DEFAULT_MODELS.closerouter,
    headers: (apiKey) => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }),
    formatRequest: (messages, model, { stream = false, temperature = 0.7, max_tokens = 4000 }) => ({
      messages,
      model,
      stream,
      temperature,
      max_tokens,
    }),
    parseChunk: (text) => {
      // Expect data: {"choices":[{"delta":{"content":"..."}}]}
      try {
        const trimmed = text.trim()
        if (!trimmed.startsWith('data:')) return null
        const json = JSON.parse(trimmed.replace(/^data:\s*/, ''))
        const delta = json?.choices?.[0]?.delta?.content
        return typeof delta === 'string' ? delta : null
      } catch {
        return null
      }
    },
    parseResponse: (json) => json.choices?.[0]?.message?.content ?? '',
    supportsStream: true,
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: DEFAULT_MODELS.openai,
    headers: (apiKey) => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }),
    formatRequest: (messages, model, { stream = false, temperature = 0.7, max_tokens = 4000 }) => ({
      messages,
      model,
      stream,
      temperature,
      max_tokens,
    }),
    parseResponse: (json) => json.choices?.[0]?.message?.content ?? '',
    supportsStream: true,
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: DEFAULT_MODELS.anthropic,
    headers: (apiKey) => ({ 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }),
    formatRequest: (messages, model, { stream = false, temperature = 0.7, max_tokens = 4000 }) => ({
      messages,
      model,
      stream,
      temperature,
      max_tokens,
    }),
    parseResponse: (json) => (json.content?.[0]?.text as string) ?? '',
    supportsStream: true,
  },
  openrouter: {
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    models: DEFAULT_MODELS.openrouter,
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'GPT Chat App'
    }),
    formatRequest: (messages, model, { stream = false, temperature = 0.7, max_tokens = 4000 }) => ({
      messages,
      model,
      stream,
      temperature,
      max_tokens,
    }),
    parseChunk: (text) => {
      try {
        const trimmed = text.trim()
        if (!trimmed.startsWith('data:')) return null
        if (trimmed === 'data: [DONE]') return null
        const json = JSON.parse(trimmed.replace(/^data:\s*/, ''))
        const delta = json?.choices?.[0]?.delta?.content
        return typeof delta === 'string' ? delta : null
      } catch {
        return null
      }
    },
    parseResponse: (json) => json.choices?.[0]?.message?.content ?? '',
    supportsStream: true,
  },
}

export type SendOptions = { provider?: ProviderKey; apiKey?: string; model: string; stream?: boolean; temperature?: number; max_tokens?: number }

export async function sendAIRequest(messages: ChatMessage[], options: SendOptions, onToken?: (t: string) => void): Promise<string> {
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY
  const providerKey: ProviderKey = options.provider || 'openrouter'
  const provider = providers[providerKey]
  const apiKey = options.apiKey || openRouterKey
  const headers = provider.headers(apiKey)
  const body = provider.formatRequest(messages, options.model, options)

  try {
    if (options.stream && provider.supportsStream && typeof onToken === 'function') {
      const resp = await fetch(provider.endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
      if (!resp.ok) {
        const errorText = await resp.text().catch(() => '')
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}${errorText ? ` - ${errorText}` : ''}`)
      }
      const reader = resp.body?.getReader()
      if (!reader) throw new Error('Stream reader not available')
      const decoder = new TextDecoder()
      let result = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // Parse SSE-ish chunks line by line
        for (const line of chunk.split('\n')) {
          const token = provider.parseChunk?.(line)
          if (token) {
            result += token
            onToken(token)
          }
        }
      }
      return result
    }

    const resp = await fetch(provider.endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
    if (!resp.ok) {
      const errorText = await resp.text().catch(() => '')
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}${errorText ? ` - ${errorText}` : ''}`)
    }
    const json = await resp.json()
    return provider.parseResponse(json)
  } catch (error: any) {
    // Add more context to network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('NetworkError: Unable to connect to the AI service. Please check your internet connection.')
    }
    throw error
  }
} 