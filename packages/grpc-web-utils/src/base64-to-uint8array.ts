export function base64ToUint8Array(base64String: string): Uint8Array {
  const binaryString = atob(base64String)
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(binaryString)
  }

  const length = binaryString.length
  const uint8Array = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i)
  }
  return uint8Array
}

export function uint8ArrayToBase64(input: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') {
    return btoa(new TextDecoder().decode(input))
  }

  const chars: string[] = new Array(input.length)

  for (let i = 0; i < input.length; i++) {
    chars[i] = String.fromCharCode(input[i]!)
  }

  return btoa(chars.join(''))
}
