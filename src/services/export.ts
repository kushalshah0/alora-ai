import type { Conversation } from '../context/ChatContext'
import { downloadText } from '../utils/helpers'

export function exportConversationJSON(convo: Conversation) {
  downloadText(`${convo.title || 'conversation'}.json`, JSON.stringify(convo, null, 2))
}

export function exportConversationTXT(convo: Conversation) {
  const lines: string[] = []
  for (const m of convo.messages) {
    lines.push(`[${m.role}] ${new Date(m.timestamp).toLocaleString()}\n${m.content}\n`)
  }
  downloadText(`${convo.title || 'conversation'}.txt`, lines.join('\n'))
} 