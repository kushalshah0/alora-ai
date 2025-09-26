export const STORAGE_KEYS = {
  THEME: 'theme',
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  CHAT: 'chatData',
  MASTER_KEY: 'ai_chat_master_key',
} as const

export type ProviderKey = 'closerouter' | 'openai' | 'anthropic' | 'openrouter'

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
    'google/gemini-2.0-flash-exp:free',
  ],
}

export const DEFAULT_PROVIDER: ProviderKey = 'openrouter' 