'use client'

import React, { useEffect, useState } from 'react'
import { RiArrowLeftLine, RiRefreshLine } from '@remixicon/react'
import { getChatbotToken, getDefaultCustomParams } from '../config'

const LinkInterceptorDemo = () => {
  const [chatbotToken, setChatbotToken] = useState('')
  const [currentUrl, setCurrentUrl] = useState('')
  const [clickedLink, setClickedLink] = useState<string | null>(null)

  const { buildChatbotUrl } = require('@/app/utils/chatbot-url-params')

  useEffect(() => {
    setChatbotToken(getChatbotToken())
  }, [])

  useEffect(() => {
    if (!chatbotToken)
      return

    const customParams = getDefaultCustomParams()
    const customParamsObj = customParams.reduce((acc, { key, value }) => {
      if (value)
        acc[key] = value
      return acc
    }, {} as Record<string, string>)

    buildChatbotUrl(chatbotToken, {
      customParams: customParamsObj,
    }).then((url: string) => {
      setCurrentUrl(url)
    })
  }, [chatbotToken, buildChatbotUrl])

  // 外部项目集成方式：直接监听 message 事件
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 处理链接点击消息
      if (event.data?.type === 'dify-link-click') {
        const url = event.data.payload.url
        console.log('[Demo] 收到链接点击:', url)

        // 判断是否为内部链接
        try {
          const linkUrl = new URL(url, window.location.origin)
          if (linkUrl.origin === window.location.origin) {
            // 内部链接：转为完整 URL
            setClickedLink(linkUrl.href)
          }
          else {
            // 外部链接：直接使用
            setClickedLink(url)
          }
        }
        catch {
          // URL 解析失败，直接使用原始 URL
          setClickedLink(url)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    console.log('[Demo] 链接拦截器监听已启动')

    return () => {
      window.removeEventListener('message', handleMessage)
      console.log('[Demo] 链接拦截器监听已停止')
    }
  }, [])

  const resetLink = () => {
    setClickedLink(null)
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b border-gray-200 bg-white/90 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">链接拦截器测试</h1>
            <p className="mt-1 text-sm text-gray-500">
              点击 Chatbot 中的链接，右侧会自动加载该链接页面
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/demo"
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
            >
              <RiArrowLeftLine className="h-4 w-4" />
              返回首页
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden p-6">
        {/* 左侧：Chatbot */}
        <div className="flex w-[50%] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">Chatbot 对话</h2>
            <p className="mt-1 text-xs text-gray-600">
              在对话中点击任何链接，右侧会自动加载
            </p>
          </div>
          <div className="flex-1 bg-white">
            {currentUrl && (
              <iframe
                id="chatbot-iframe"
                src={currentUrl}
                className="h-full w-full"
                title="Chatbot"
                key={currentUrl}
              />
            )}
          </div>
        </div>

        {/* 右侧：链接预览 */}
        <div className="flex w-[50%] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">链接预览</h2>
              {clickedLink && (
                <p className="mt-1 max-w-md truncate text-xs text-gray-600" title={clickedLink}>
                  {clickedLink}
                </p>
              )}
            </div>
            {clickedLink && (
              <button
                type="button"
                onClick={resetLink}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <RiRefreshLine className="h-4 w-4" />
                重置
              </button>
            )}
          </div>
          <div className="flex-1 bg-white">
            {clickedLink
              ? (
                <iframe
                  src={clickedLink}
                  className="h-full w-full"
                  title="Link Preview"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              )
              : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                    <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">等待链接点击</h3>
                  <p className="max-w-sm text-sm text-gray-600">
                    在左侧 Chatbot 中点击任何链接，该链接的内容会在这里显示
                  </p>
                  <div className="mt-6 space-y-2 text-left text-xs text-gray-500">
                    <p>✅ 支持内部链接（如 /resume）</p>
                    <p>✅ 支持外部链接（如 https://...）</p>
                    <p>✅ 支持 HTML <code className="rounded bg-gray-100 px-1">&lt;a&gt;</code> 标签</p>
                    <p>✅ 支持 Markdown 链接语法</p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="border-t border-gray-200 bg-white/90 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>使用外部集成方式（window.addEventListener）</span>
            </div>
            <div>
              打开浏览器控制台（F12）查看详细日志
            </div>
          </div>
          <div>
            Token: <code className="rounded bg-gray-100 px-1.5 py-0.5">{chatbotToken || '加载中...'}</code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LinkInterceptorDemo
