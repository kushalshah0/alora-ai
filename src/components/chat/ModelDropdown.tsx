import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'

// Helper function to format model names for display
function formatModelName(modelPath: string): string {
  // Handle Gemini models (direct format: gemini-2.5-flash, gemini-2.5-pro, etc.)
  if (modelPath.startsWith('gemini-')) {
    if (modelPath === 'gemini-2.5-flash') return 'Gemini 2.5 Flash'
    if (modelPath === 'gemini-2.5-pro') return 'Gemini 2.5 Pro'
    if (modelPath === 'gemini-2.0-flash') return 'Gemini 2.0 Flash'
    if (modelPath === 'gemini-flash-latest') return 'Gemini Flash (Latest)'
    if (modelPath === 'gemini-pro-latest') return 'Gemini Pro (Latest)'
    
    // Pollinations.AI models
    if (modelPath === 'pollinations-text') return 'Pollinations Text'
    if (modelPath === 'flux') return 'Flux (Image)'
    if (modelPath === 'turbo') return 'Turbo (Image)'
    if (modelPath === 'nanobanana') return 'Nano Banana (Image)'
    if (modelPath === 'seedream') return 'SeeDream (Image)'
    // Fallback for other Gemini models
    return modelPath.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
  
  // Handle OpenRouter format: provider/model-name or provider/model-name:variant
  const parts = modelPath.split('/')
  if (parts.length === 2) {
    const model = parts[1]
    const modelWithoutVariant = model.split(':')[0] // Remove :free, :beta etc
    
    // Custom formatting for better display names
    if (modelWithoutVariant.includes('deepseek-chat')) return 'DeepSeek'
    if (modelWithoutVariant.includes('grok-4-fast')) return 'Grok-4-Fast'
    if (modelWithoutVariant.includes('qwen3-coder')) return 'Qwen3 Coder'
    if (modelWithoutVariant.includes('gemini-2.0-flash-exp')) return 'Gemini 2.0 Flash'
    if (modelWithoutVariant.includes('llama-3.3-70b-instruct')) return 'Llama 3.3 70B'
    if (modelWithoutVariant.includes('gpt-oss-20b')) return 'GPT-5'
    if (modelWithoutVariant.includes('claude-3.5-sonnet')) return 'Claude 3.5 Sonnet'
    if (modelWithoutVariant.includes('claude-3-opus')) return 'Claude 3 Opus'
    if (modelWithoutVariant.includes('claude-3-sonnet')) return 'Claude 3 Sonnet'
    if (modelWithoutVariant.includes('gpt-4o')) return 'GPT-4o'
    if (modelWithoutVariant.includes('gpt-4-turbo')) return 'GPT-4 Turbo'
    if (modelWithoutVariant.includes('llama-3.1-405b')) return 'Llama 3.1 405B'
    if (modelWithoutVariant.includes('gemini-pro-1.5')) return 'Gemini Pro 1.5'
    if (modelWithoutVariant.includes('mixtral-8x7b')) return 'Mixtral 8x7B'
    
    // Fallback: capitalize first letter of model name
    return modelWithoutVariant.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
  
  // Fallback for other formats
  return modelPath
}

export function ModelDropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const current = formatModelName(value)

  return (
    <div ref={ref} className="relative inline-flex items-center rounded-full glass px-3 py-1.5 select-none transition-all duration-200 hover:shadow-md">
      <Sparkles size={16} className="mr-2 text-blue-600 transition-transform duration-200 hover:scale-110" />
      <button type="button" onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-sm outline-none transition-all duration-200">
        <span className="truncate max-w-[160px]">{current}</span>
        <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} />
      </button>
      {open && (
        <div className="absolute right-0 left-auto top-full mt-2 w-56 max-w-[calc(100vw-1rem)] sm:max-w-none backdrop-blur-3xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/40 rounded-xl overflow-hidden shadow-2xl z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <ul className="max-h-64 overflow-auto py-2 [&::-webkit-scrollbar]:w-0 [scrollbar-width:none]">
            {options.map((opt, index) => (
              <li key={opt} className="animate-in slide-in-from-top-1 fade-in duration-200" style={{ animationDelay: `${index * 20}ms` }}>
                <button
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 hover:backdrop-blur-sm hover:bg-white/40 dark:hover:bg-gray-800/40 hover:scale-[1.02] active:scale-[0.98] ${opt === value ? 'font-semibold bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  <span className="flex items-center">
                    {formatModelName(opt)}
                    {opt === value && <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 