import { STORAGE_KEYS } from '../utils/constants'

async function getOrCreateMasterKey(): Promise<CryptoKey> {
  let keyB64 = localStorage.getItem(STORAGE_KEYS.MASTER_KEY)
  if (!keyB64) {
    const raw = crypto.getRandomValues(new Uint8Array(32))
    keyB64 = btoa(String.fromCharCode(...raw))
    localStorage.setItem(STORAGE_KEYS.MASTER_KEY, keyB64)
  }
  const rawBytes = Uint8Array.from(atob(keyB64), c => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', rawBytes, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptString(plainText: string): Promise<string> {
  const key = await getOrCreateMasterKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plainText)
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  const payload = new Uint8Array(iv.byteLength + cipher.byteLength)
  payload.set(iv, 0)
  payload.set(new Uint8Array(cipher), iv.byteLength)
  return btoa(String.fromCharCode(...payload))
}

export async function decryptString(cipherTextB64: string): Promise<string> {
  const key = await getOrCreateMasterKey()
  const payload = Uint8Array.from(atob(cipherTextB64), c => c.charCodeAt(0))
  const iv = payload.slice(0, 12)
  const data = payload.slice(12)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return new TextDecoder().decode(plain)
} 