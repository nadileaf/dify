'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getChatbotToken, getDefaultCustomParams } from '../config'

// 代码示例常量
const CODE_EXAMPLES = {
  compress: `async function compressAndEncodeBase64(input) {
  const uint8Array = new TextEncoder().encode(input);
  const compressedStream = new Response(
    new Blob([uint8Array]).stream()
      .pipeThrough(new CompressionStream('gzip'))
  ).arrayBuffer();
  const compressedUint8Array = new Uint8Array(
    await compressedStream
  );
  return btoa(String.fromCharCode(...compressedUint8Array));
}`,

  batchCompress: `async function getCompressedInputs(inputs) {
  const compressedInputs = {};
  await Promise.all(
    Object.entries(inputs).map(async ([key, value]) => {
      compressedInputs[key] = 
        await compressAndEncodeBase64(value);
    })
  );
  return compressedInputs;
}`,

  buildUrl: `async function buildChatbotUrl(token, options) {
  const params = new URLSearchParams();
  
  // 基础参数（不压缩）
  if (options.prompt) 
    params.append('prompt', options.prompt);
  if (options.hideTitle) 
    params.append('hideTitle', 'true');
  if (options.backgroundColor) 
    params.append('backgroundColor', options.backgroundColor);
  
  // 系统参数（压缩）
  const systemInputs = {};
  if (options.conversationId)
    systemInputs['sys.conversation_id'] = options.conversationId;
  if (options.userId)
    systemInputs['sys.user_id'] = options.userId;
  
  // 自定义参数
  if (options.customParams) {
    Object.entries(options.customParams).forEach(([k, v]) => {
      if (v) systemInputs[k] = v;
    });
  }
  
  if (Object.keys(systemInputs).length > 0) {
    const compressed = await getCompressedInputs(systemInputs);
    Object.entries(compressed).forEach(([k, v]) => {
      params.append(k, v);
    });
  }
  
  const url = \`/chatbot/\${token}?\${params}\`;
  
  if (url.length > 65536) {
    console.warn('URL过长，可能导致加载失败');
  }
  
  return url;
}`,

  usage: `// 示例 1: 只使用基础参数
const url1 = await buildChatbotUrl('token123', {
  prompt: '你好',
  hideTitle: true,
  backgroundColor: '#FFFFFF'
});

// 示例 2: 包含系统参数和自定义参数
const url2 = await buildChatbotUrl('token123', {
  prompt: '帮我分析这份简历',
  conversationId: 'conv_123',
  userId: 'user_456',
  customParams: {
    resumeid: '259289',
    jobid: 'job123'
  }
});

// 示例 3: 在 iframe 中使用
const iframe = document.createElement('iframe');
iframe.src = await buildChatbotUrl('token123', {
  prompt: '开始对话',
  userId: 'user_789'
});
document.body.appendChild(iframe);`,
}

const ChatbotParamsDemo = () => {
  const [chatbotToken, setChatbotToken] = useState('')
  const [prompt, setPrompt] = useState('你好，请介绍一下你自己')
  const [hideTitle, setHideTitle] = useState(true)
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [useCustomBg, setUseCustomBg] = useState(true)

  const [conversationId, setConversationId] = useState('')
  const userId = 'demo_user_123'
  const [customParams, setCustomParams] = useState<Array<{ key: string, value: string }>>([])

  useEffect(() => {
    setChatbotToken(getChatbotToken())
    setCustomParams(getDefaultCustomParams())
  }, [])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { buildChatbotUrl } = require('@/app/utils/chatbot-url-params')

  const [copySuccess, setCopySuccess] = useState('')

  const buildIframeUrl = async () => {
    const customParamsObj: Record<string, string> = {}
    customParams.forEach(({ key, value }) => {
      if (key && value)
        customParamsObj[key] = value
    })

    return await buildChatbotUrl(chatbotToken, {
      prompt: prompt || undefined,
      hideTitle: hideTitle || undefined,
      backgroundColor: (useCustomBg && backgroundColor) ? backgroundColor : undefined,
      conversationId: conversationId || undefined,
      userId: userId || undefined,
      customParams: Object.keys(customParamsObj).length > 0 ? customParamsObj : undefined,
    })
  }

  const addCustomParam = () => {
    setCustomParams([...customParams, { key: '', value: '' }])
  }

  const removeCustomParam = (index: number) => {
    setCustomParams(customParams.filter((_, i) => i !== index))
  }

  const updateCustomParam = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...customParams]
    newParams[index][field] = value
    setCustomParams(newParams)
  }

  const getUrlLengthColor = (length: number) => {
    if (length > 65536)
      return 'text-red-600'
    if (length > 2048)
      return 'text-yellow-600'
    return 'text-green-600'
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(`✅ ${label} 已复制`)
      setTimeout(() => setCopySuccess(''), 2000)
    }
    catch (err) {
      console.error('复制失败:', err)
      setCopySuccess('❌ 复制失败')
      setTimeout(() => setCopySuccess(''), 2000)
    }
  }

  const handleSend = async () => {
    const iframe = document.getElementById('chatbot-iframe') as HTMLIFrameElement
    if (iframe)
      iframe.src = await buildIframeUrl()
  }

  const [currentUrl, setCurrentUrl] = useState('')

  // 实时更新URL预览
  useEffect(() => {
    const updateUrl = async () => {
      const url = await buildIframeUrl()
      setCurrentUrl(url)
    }
    updateUrl()
  }, [chatbotToken, prompt, hideTitle, backgroundColor, useCustomBg, conversationId, userId, customParams])

  const handleNewConversation = async () => {
    setConversationId('')
    const iframe = document.getElementById('chatbot-iframe') as HTMLIFrameElement
    if (iframe) {
      // 构建新会话的URL（不带conversationId）
      const url = await buildChatbotUrl(chatbotToken, {
        prompt: prompt || undefined,
        hideTitle: hideTitle || undefined,
        backgroundColor: (useCustomBg && backgroundColor) ? backgroundColor : undefined,
        conversationId: undefined, // 明确设置为空
        userId: userId || undefined,
        customParams: (() => {
          const customParamsObj: Record<string, string> = {}
          customParams.forEach(({ key, value }) => {
            if (key && value)
              customParamsObj[key] = value
          })
          return Object.keys(customParamsObj).length > 0 ? customParamsObj : undefined
        })(),
      })
      iframe.src = url
    }
  }

  const presetColors = [
    { name: '白色', value: '#FFFFFF' },
    { name: '浅灰', value: '#F5F5F5' },
    { name: '浅蓝', value: '#E3F2FD' },
    { name: '浅绿', value: '#E8F5E9' },
    { name: '浅紫', value: '#F3E5F5' },
    { name: '浅粉', value: '#FCE4EC' },
  ]

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chatbot 参数测试</h1>
            <p className="mt-1 text-sm text-gray-600">测试 prompt、hideTitle、backgroundColor 参数</p>
          </div>
          <Link
            href="/demo"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            返回首页
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧参数配置区 */}
        <div className="w-96 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
          <div className="space-y-4">
            {/* Chatbot Token 区域 */}
            <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
              <h3 className="mb-3 flex items-center text-sm font-bold text-gray-900">
                <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">🔑</span>
                Chatbot Token
              </h3>
              <input
                type="text"
                value={chatbotToken}
                onChange={e => setChatbotToken(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="输入 chatbot token"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setChatbotToken('igJgPiPgHAEX6uP4')}
                  className="flex-1 rounded-lg bg-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300"
                >
                  重置为默认
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-600">修改 token 可切换不同的 chatbot</p>
            </div>

            {/* Prompt 区域 */}
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-3 flex items-center text-sm font-bold text-gray-900">
                <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white">1</span>
                Prompt 内容
              </h3>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
                placeholder="输入要自动发送的消息..."
              />
              <p className="mt-2 text-xs text-gray-600">留空则不自动发送</p>

              <button
                type="button"
                onClick={async () => {
                  await handleNewConversation()
                }}
                className="mt-3 w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-lg"
              >
                🚀 发送并新建会话
              </button>
            </div>

            {/* UI 参数区域 */}
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <h3 className="mb-3 flex items-center text-sm font-bold text-gray-900">
                <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs text-white">2</span>
                UI 参数
              </h3>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">隐藏标题栏</span>
                  <input
                    type="checkbox"
                    checked={hideTitle}
                    onChange={e => setHideTitle(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">自定义背景色</span>
                  <input
                    type="checkbox"
                    checked={useCustomBg}
                    onChange={e => setUseCustomBg(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </label>

                {useCustomBg && (
                  <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={e => setBackgroundColor(e.target.value)}
                        className="h-10 w-16 cursor-pointer rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={e => setBackgroundColor(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="#FFFFFF"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {presetColors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setBackgroundColor(color.value)}
                          className="flex items-center gap-1 rounded-lg border border-gray-300 p-2 text-xs transition-colors hover:bg-gray-50"
                        >
                          <div
                            className="h-4 w-4 rounded border border-gray-300"
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="text-gray-700">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSend}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
            >
              应用参数并刷新
            </button>

            {/* 系统参数区域 */}
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center text-sm font-bold text-gray-900">
                  <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs text-white">3</span>
                  系统参数
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                >
                  {showAdvanced ? '收起' : '展开'}
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    系统参数会被压缩和 Base64 编码后添加到 URL 中
                  </p>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      用户 ID (sys.user_id)
                    </label>
                    <div className="rounded-lg bg-gray-100 px-3 py-2">
                      <code className="text-sm text-gray-700">{userId}</code>
                      <span className="ml-2 text-xs text-gray-500">(固定)</span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700">
                        会话 ID (sys.conversation_id)
                      </label>
                      <button
                        type="button"
                        onClick={handleNewConversation}
                        className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
                      >
                        新建会话
                      </button>
                    </div>
                    <input
                      type="text"
                      value={conversationId}
                      onChange={e => setConversationId(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="留空表示新会话"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {conversationId ? '当前会话' : '新会话模式'}
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700">
                        自定义参数
                      </label>
                      <button
                        type="button"
                        onClick={addCustomParam}
                        className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                      >
                        + 添加
                      </button>
                    </div>
                    <div className="space-y-2">
                      {customParams.map((param, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={param.key}
                            onChange={e => updateCustomParam(index, 'key', e.target.value)}
                            className="w-1/3 rounded-lg border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="参数名"
                          />
                          <input
                            type="text"
                            value={param.value}
                            onChange={e => updateCustomParam(index, 'value', e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="参数值"
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomParam(index)}
                            className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                          >
                            删除
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      示例: resumeid=259289, jobid=job123, projectid=proj456
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 代码示例区域 */}
            <details className="rounded-lg border border-gray-300 bg-white">
              <summary className="flex cursor-pointer items-center px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50">
                <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">4</span>
                代码示例
              </summary>
              <div className="border-t border-gray-200 p-4">
                <div className="space-y-3">
                  <h4 className="mb-2 text-xs font-semibold text-gray-900">📖 参数说明</h4>
                  <div className="space-y-2 text-xs text-gray-700">
                    <div>
                      <strong>基础参数：</strong>
                      <ul className="ml-4 mt-1 list-disc space-y-1">
                        <li>
                          <code className="rounded bg-white px-1">prompt</code>
                          {' '}
                          - 自动发送的消息
                        </li>
                        <li>
                          <code className="rounded bg-white px-1">hideTitle</code>
                          {' '}
                          - 隐藏标题栏（true/false）
                        </li>
                        <li>
                          <code className="rounded bg-white px-1">backgroundColor</code>
                          {' '}
                          - 背景色（十六进制）
                        </li>
                      </ul>
                    </div>
                    <div>
                      <strong>系统参数（压缩编码）：</strong>
                      <ul className="ml-4 mt-1 list-disc space-y-1">
                        <li>
                          <code className="rounded bg-white px-1">sys.conversation_id</code>
                          {' '}
                          - 会话ID
                        </li>
                        <li>
                          <code className="rounded bg-white px-1">sys.user_id</code>
                          {' '}
                          - 用户ID
                        </li>
                        <li>
                          <code className="rounded bg-white px-1">customParams</code>
                          {' '}
                          - 任意自定义参数（动态）
                        </li>
                      </ul>
                      <p className="ml-4 mt-1 text-xs text-gray-600">
                        自定义参数示例：resumeid, jobid, projectid 等
                      </p>
                    </div>
                  </div>
                </div>

                {copySuccess && (
                  <div className="rounded-lg border border-green-300 bg-green-100 px-3 py-2 text-center text-sm text-green-800">
                    {copySuccess}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-gray-700">1. 压缩和编码工具函数</h4>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(CODE_EXAMPLES.compress, '代码')}
                        className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                      >
                        复制
                      </button>
                    </div>
                    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
                      <code>{CODE_EXAMPLES.compress}</code>
                    </pre>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-gray-700">2. 批量压缩参数</h4>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(CODE_EXAMPLES.batchCompress, '代码')}
                        className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                      >
                        复制
                      </button>
                    </div>
                    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
                      <code>{CODE_EXAMPLES.batchCompress}</code>
                    </pre>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-gray-700">3. 构建完整 URL</h4>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(CODE_EXAMPLES.buildUrl, '代码')}
                        className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                      >
                        复制
                      </button>
                    </div>
                    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
                      <code>{CODE_EXAMPLES.buildUrl}</code>
                    </pre>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-gray-700">4. 使用示例</h4>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(CODE_EXAMPLES.usage, '代码')}
                        className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                      >
                        复制
                      </button>
                    </div>
                    <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
                      <code>{CODE_EXAMPLES.usage}</code>
                    </pre>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="text-xs text-gray-700">
                      💡
                      {' '}
                      <strong>提示：</strong>
                      点击"复制"按钮可以快速复制代码到剪贴板
                    </p>
                  </div>
                </div>
              </div>
            </details>

            <button
              type="button"
              onClick={handleSend}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
            >
              应用参数并刷新
            </button>

          </div>
        </div>

        {/* 右侧预览区 */}
        <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
          {/* URL 预览区 */}
          <div className="border-b border-gray-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">地址栏</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${getUrlLengthColor(currentUrl.length)}`}>
                  {currentUrl.length.toLocaleString()}
                  {' '}
                  字符
                </span>
                {currentUrl && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentUrl, 'URL')}
                    className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
                  >
                    复制
                  </button>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
              <code className="block max-h-16 overflow-auto break-all text-xs text-gray-800">
                {currentUrl || '等待参数配置...'}
              </code>
            </div>
            {currentUrl.length > 65536 && (
              <p className="mt-2 text-xs text-red-600">
                ⚠️ URL 超过 65,536 字符（Firefox 限制），可能导致加载失败
              </p>
            )}
            {currentUrl.length > 2048 && currentUrl.length <= 65536 && (
              <p className="mt-2 text-xs text-yellow-600">
                ℹ️ URL 超过 2,048 字符但在浏览器支持范围内
              </p>
            )}
          </div>

          {/* Chatbot 预览区 - 像浏览器一样 */}
          <div className="flex flex-1 flex-col overflow-hidden bg-white">
            <iframe
              id="chatbot-iframe"
              src=""
              className="h-full w-full border-0"
              title="Chatbot Preview"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatbotParamsDemo
