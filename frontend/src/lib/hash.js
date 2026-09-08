// Real SHA-256 hashing, computed in the browser with the native Web Crypto API.
// No library needed — a genuine fingerprint of a file's contents.
export async function sha256Hex(file) {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  // Convert the ArrayBuffer into a lowercase hex string.
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}