/**
 * Chatbot URL 参数处理工具
 *
 * 提供用于构建 Chatbot URL 的工具函数，包括参数压缩和编码
 */

/**
 * 使用 gzip 压缩并 Base64 编码字符串
 */
export async function compressAndEncodeBase64(input: string): Promise<string> {
  const uint8Array = new TextEncoder().encode(input)
  const compressedStream = new Response(
    new Blob([uint8Array]).stream().pipeThrough(new CompressionStream('gzip')),
  ).arrayBuffer()
  const compressedUint8Array = new Uint8Array(await compressedStream)
  return btoa(String.fromCharCode(...compressedUint8Array))
}

/**
 * 批量压缩参数对象
 */
export async function getCompressedInputs(inputs: Record<string, string>): Promise<Record<string, string>> {
  const compressedInputs: Record<string, string> = {}
  await Promise.all(
    Object.entries(inputs).map(async ([key, value]) => {
      if (value)
        compressedInputs[key] = await compressAndEncodeBase64(value)
    }),
  )
  return compressedInputs
}

/**
 * Chatbot URL 构建选项
 */
export type ChatbotUrlOptions = {
  // 基础参数（不压缩）
  prompt?: string
  hideTitle?: boolean
  backgroundColor?: string

  // 系统参数（需压缩）
  conversationId?: string
  userId?: string

  // 自定义参数（需压缩）- 使用 customParams 传递任意参数
  customParams?: Record<string, string>
}

/**
 * 构建 Chatbot URL
 *
 * @param token - Chatbot token
 * @param options - URL 参数选项
 * @returns 完整的 Chatbot URL
 *
 * @example
 * ```ts
 * const url = await buildChatbotUrl('token123', {
 *   prompt: '你好',
 *   hideTitle: true,
 *   backgroundColor: '#FFFFFF',
 *   conversationId: 'conv_123',
 *   userId: 'user_456',
 *   customParams: {
 *     resumeid: '259289',
 *     jobid: 'job123',
 *     projectid: 'proj456'
 *   }
 * })
 * ```
 */
export async function buildChatbotUrl(token: string, options: ChatbotUrlOptions = {}): Promise<string> {
  const params = new URLSearchParams()

  // 基础参数（直接添加，不压缩）
  if (options.prompt)
    params.append('prompt', options.prompt)
  if (options.hideTitle)
    params.append('hideTitle', 'true')
  if (options.backgroundColor)
    params.append('backgroundColor', options.backgroundColor)

  // 系统参数（压缩后添加）
  const systemInputs: Record<string, string> = {}

  if (options.conversationId)
    systemInputs['sys.conversation_id'] = options.conversationId
  if (options.userId)
    systemInputs['sys.user_id'] = options.userId

  // 自定义参数（压缩后添加）
  if (options.customParams) {
    Object.entries(options.customParams).forEach(([key, value]) => {
      if (value)
        systemInputs[key] = value
    })
  }

  if (Object.keys(systemInputs).length > 0) {
    const compressedInputs = await getCompressedInputs(systemInputs)
    Object.entries(compressedInputs).forEach(([key, value]) => {
      params.append(key, value)
    })
  }

  const queryString = params.toString()
  const baseUrl = `/chatbot/${token}`
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl

  // URL 长度检查（Firefox 限制为 65,536 字符）
  if (url.length > 65536)
    console.warn('⚠️ URL 超过 65,536 字符，可能导致某些浏览器加载失败')

  return url
}

/**
 * 从 URL 解码和解压缩参数
 *
 * @param compressedValue - 压缩编码的参数值
 * @returns 解压后的字符串
 */
export async function decodeAndDecompress(compressedValue: string): Promise<string> {
  try {
    const binaryString = atob(compressedValue)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++)
      bytes[i] = binaryString.charCodeAt(i)

    const decompressedStream = new Response(
      new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')),
    ).arrayBuffer()

    const decompressedBytes = new Uint8Array(await decompressedStream)
    return new TextDecoder().decode(decompressedBytes)
  }
  catch (error) {
    console.error('解压参数失败:', error)
    return ''
  }
}
