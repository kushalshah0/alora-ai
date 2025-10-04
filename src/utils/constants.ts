export const STORAGE_KEYS = {
  THEME: 'theme',
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  CHAT: 'chatData',
  MASTER_KEY: 'ai_chat_master_key',
} as const

export type ProviderKey = 'closerouter' | 'openai' | 'anthropic' | 'openrouter' | 'gemini' | 'pollinations'

export const DEFAULT_MODELS: Record<ProviderKey, string[]> = {
  closerouter: ['gpt-4o', 'gpt-4', 'claude-3-sonnet', 'gemini-pro'],
  openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  openrouter: [
    'openai/gpt-oss-20b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-chat-v3.1:free',
    'x-ai/grok-4-fast:free',
    'qwen/qwen3-coder:free',
  ],
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-flash-latest'],
  pollinations: [
    'pollinations-text', 
    'flux', 
    'turbo', 
    'nanobanana', 
    'seedream'
  ],
}

export const DEFAULT_PROVIDER: ProviderKey = 'gemini'

// Default model selection
export const DEFAULT_MODEL = 'gemini-2.5-flash'

// Text models (for conversations)
export const TEXT_MODELS = [
  ...DEFAULT_MODELS.gemini,
  ...DEFAULT_MODELS.openrouter,
  'pollinations-text',
]

// Image models (for image generation)
export const IMAGE_MODELS = [
  'flux', 
  'turbo', 
  'nanobanana', 
  'seedream'
]

// Combined model list for the dropdown (Gemini models + OpenRouter models + Pollinations models)
export const AVAILABLE_MODELS = [
  ...DEFAULT_MODELS.gemini,
  ...DEFAULT_MODELS.openrouter,
  ...DEFAULT_MODELS.pollinations,
]

// Helper function to determine which provider to use for a given model
export function getProviderForModel(model: string): ProviderKey {
  if (DEFAULT_MODELS.gemini.includes(model)) {
    return 'gemini'
  }
  if (DEFAULT_MODELS.openrouter.includes(model)) {
    return 'openrouter'
  }
  if (DEFAULT_MODELS.pollinations.includes(model)) {
    return 'pollinations'
  }
  // Default fallback
  return 'openrouter'
}

// Helper function to get default model for a given mode
export function getDefaultModelForMode(mode: 'text' | 'image'): string {
  return mode === 'text' ? DEFAULT_MODEL : 'flux'
} 