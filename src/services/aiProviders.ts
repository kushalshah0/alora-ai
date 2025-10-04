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
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    }),
    formatRequest: (messages: ChatMessage[], model: string, { temperature = 0.7, max_tokens = 1000 }) => ({
      model,
      max_tokens,
      temperature,
      messages: messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    }),
    parseResponse: (data: any) => data.content[0].text
  },

  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: DEFAULT_MODELS.gemini,
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    }),
    formatRequest: (messages: ChatMessage[], model: string, { temperature = 0.7, max_tokens = 8192 }) => ({
      contents: messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: max_tokens,
      }
    }),
    parseResponse: (data: any) => data.candidates[0]?.content?.parts[0]?.text || 'No response'
  },

  pollinations: {
    endpoint: 'https://text.pollinations.ai',
    models: DEFAULT_MODELS.pollinations,
    headers: () => ({ 'Content-Type': 'application/json' }),
    formatRequest: (messages: ChatMessage[], model: string) => {
      // Different handling for text vs image models
      if (model === 'pollinations-text') {
        return { messages }
      } else {
        // Image models - get the last user message as the image prompt
        const lastUserMessage = messages.filter(m => m.role === 'user').pop()
        return {
          prompt: lastUserMessage?.content || 'a beautiful image',
          model: model
        }
      }
    },
    parseResponse: (data: any) => data || 'Generated successfully'
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
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
  const providerKey: ProviderKey = options.provider || 'gemini'
  const provider = providers[providerKey]
  
  let apiKey = options.apiKey || openRouterKey
  let endpoint = provider.endpoint
  
  // Special handling for different APIs
  if (providerKey === 'gemini') {
    apiKey = options.apiKey || geminiKey
    endpoint = `${provider.endpoint}/${options.model}:generateContent`
  } else if (providerKey === 'pollinations') {
    // Pollinations.AI - different handling for text vs image models
    if (options.model === 'pollinations-text') {
      // Text generation using POST endpoint
      const headers = provider.headers('')
      const body = provider.formatRequest(messages, options.model, options)
      
      try {
        const resp = await fetch('https://text.pollinations.ai/', { 
          method: 'POST', 
          headers,
          body: JSON.stringify(body)
        })
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
        }
        
        const text = await resp.text()
        return text || 'No response from text model'
      } catch (error: any) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('NetworkError: Unable to connect to Pollinations.AI text service.')
        }
        throw error
      }
    } else {
      // Image generation using GET endpoint
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()
      const prompt = encodeURIComponent(lastUserMessage?.content || 'a beautiful image')
      endpoint = `https://image.pollinations.ai/prompt/${prompt}?model=${options.model}`
      
      try {
        const resp = await fetch(endpoint, { method: 'GET' })
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
        }
        
        // For Pollinations images, we return just the image markdown
        return `![Generated Image](${endpoint})`
      } catch (error: any) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('NetworkError: Unable to connect to Pollinations.AI image service.')
        }
        throw error
      }
    }
  }
  
  const headers = provider.headers(apiKey)
  const body = provider.formatRequest(messages, options.model, options)

  try {
    if (options.stream && provider.supportsStream && typeof onToken === 'function') {
      const resp = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
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

    const resp = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
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