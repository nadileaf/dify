'use client'

import { RiDownloadLine, RiFileCopyLine } from '@remixicon/react'
import { useEffect, useState } from 'react'
import { Markdown } from '@/app/components/base/markdown'

const IntegrationDocsPage = () => {
  const [content, setContent] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    fetch('/CHATBOT_INTEGRATION.md')
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(err => console.error('Failed to load documentation:', err))
  }, [])

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'CHATBOT_INTEGRATION.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="shrink-0 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chatbot 集成文档</h1>
            <p className="mt-1 text-sm text-gray-500">
              完整的集成指南、API 说明和代码示例
            </p>
          </div>
          <div className="flex items-center gap-2">
            {content && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <RiFileCopyLine className="h-4 w-4" />
                  {copySuccess ? '已复制' : '复制全文'}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                >
                  <RiDownloadLine className="h-4 w-4" />
                  下载文档
                </button>
              </>
            )}
            <a
              href="/demo"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
            >
              返回首页
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-6">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            {content
              ? (
                  <div className="prose prose-slate prose-headings:font-bold prose-h1:text-3xl prose-h2:mt-8 prose-h2:border-b prose-h2:pb-2 prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-gray-800 prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-table:text-sm prose-th:bg-gray-100 prose-th:font-semibold prose-td:border prose-td:border-gray-300 prose-th:border prose-th:border-gray-300 prose-img:rounded-lg max-w-none">
                    <Markdown content={content} />
                  </div>
                )
              : (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                      <p className="text-gray-600">加载文档中...</p>
                    </div>
                  </div>
                )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default IntegrationDocsPage
