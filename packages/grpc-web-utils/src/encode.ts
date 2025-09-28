export const encode = (message: Uint8Array) => {
  const size = message.length
  const buffer = new Uint8Array(5 + size)
  const dataview = new DataView(buffer.buffer, 0, buffer.byteLength)
  dataview.setInt8(0, 0)
  dataview.setUint32(1, size)
  buffer.set(message, 5) // 整个消息
  return buffer
}
