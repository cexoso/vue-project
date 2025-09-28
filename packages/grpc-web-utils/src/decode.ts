// 在 http2 上的 grpc 消息，第一位表示是否启用压缩，目前先不支持压缩
// 接下来的四个字节，表示之后消息的长度，采用大端序读取
export const decode = (input: Uint8Array) => {
  let offset = 0
  const dataview = new DataView(input.buffer, 0, input.byteLength)
  const needCompress = dataview.getInt8(offset)
  if (needCompress !== 0) {
    // 不打算在消息级别支持压缩，这要求在请求时不传递 grpc-accept-encoding
    throw new Error('不支持压缩')
  }
  offset += 1
  const packetLength = dataview.getInt32(offset, false)
  offset += 4

  const message = input.subarray(offset, offset + packetLength)
  offset += packetLength

  return message
}
