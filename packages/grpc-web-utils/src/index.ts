// 这个文件需要在浏览器上使用，所以不要使用 node 独有的 api

// 在 http2 上的 grpc 消息，第一位表示是否启用压缩，目前先不支持压缩
// 接下来的四个字节，表示之后消息的长度，采用大端序读取

export { decode } from './decode'
export { encode } from './encode'

export { base64ToUint8Array, uint8ArrayToBase64 } from './base64-to-uint8array'
