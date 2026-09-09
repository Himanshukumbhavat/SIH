const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function decodeBase32(value) {
  let bits = ''
  for (const character of value.replace(/=+$/, '').toUpperCase()) {
    const index = BASE32.indexOf(character)
    if (index < 0) throw new Error('Invalid authenticator secret.')
    bits += index.toString(2).padStart(5, '0')
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8))
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(bits.slice(i * 8, i * 8 + 8), 2)
  }
  return bytes
}

export function createSecret() {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => BASE32[byte % BASE32.length]).join('')
}

export function getOtpAuthUri(email, secret) {
  return `otpauth://totp/DEMS:${encodeURIComponent(email)}?secret=${secret}&issuer=DEMS&algorithm=SHA1&digits=6&period=30`
}

export async function getTotpCode(secret, timestamp = Date.now()) {
  const counter = Math.floor(timestamp / 1000 / 30)
  const counterBytes = new ArrayBuffer(8)
  const view = new DataView(counterBytes)
  view.setUint32(0, Math.floor(counter / 0x100000000))
  view.setUint32(4, counter >>> 0)
  const key = await crypto.subtle.importKey(
    'raw',
    decodeBase32(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, counterBytes))
  const offset = digest[digest.length - 1] & 0x0f
  const binary = ((digest[offset] & 0x7f) << 24)
    | (digest[offset + 1] << 16)
    | (digest[offset + 2] << 8)
    | digest[offset + 3]
  return String(binary % 1000000).padStart(6, '0')
}

export async function verifyTotpCode(secret, code) {
  const normalized = code.replace(/\s/g, '')
  if (!/^\d{6}$/.test(normalized)) return false
  const now = Date.now()
  for (const drift of [-30000, 0, 30000]) {
    if (await getTotpCode(secret, now + drift) === normalized) return true
  }
  return false
}
