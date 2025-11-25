'use client'
import Link from 'next/link'

const DemoIndex = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Dify Demo 页面</h1>
          <p className="text-gray-600">选择要测试的功能</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/demo/integration"
            className="group block rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-white">
              📘 集成文档
            </h2>
            <p className="text-orange-100">
              完整的 Chatbot 集成指南，包含所有功能说明和代码示例
            </p>
          </Link>

          <Link
            href="/demo/chatbot-params"
            className="group block rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 group-hover:text-blue-600">
              Chatbot 参数测试
            </h2>
            <p className="text-gray-600">
              测试 chatbot 页面的 URL 参数功能：prompt、hideTitle、backgroundColor
            </p>
          </Link>

          <Link
            href="/demo/entity-tags"
            className="group block rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 group-hover:text-green-600">
              实体标签测试
            </h2>
            <p className="text-gray-600">
              测试通过 postMessage 向 Chatbot 发送实体标签（用户、订单、产品等）
            </p>
          </Link>

          <Link
            href="/html-test"
            className="group block rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 group-hover:text-purple-600">
              HTML 渲染测试
            </h2>
            <p className="text-gray-600">
              测试 Markdown 中 HTML 标签的渲染效果，支持实时编辑预览
            </p>
          </Link>
        </div>

        <div className="mt-12 rounded-xl bg-white/50 p-6 backdrop-blur">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">使用说明</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs text-white">📘</span>
              <span><strong>集成文档：</strong>查看完整的 Chatbot 集成指南，包含 URL 参数、实体标签功能说明和多框架代码示例</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs text-white">1</span>
              <span><strong>Chatbot 参数测试：</strong>可以动态调整 prompt、hideTitle、backgroundColor 参数，实时预览效果</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs text-white">2</span>
              <span><strong>实体标签测试：</strong>测试通过 postMessage 向 Chatbot 发送实体对象，以标签形式展示在输入框</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs text-white">3</span>
              <span><strong>HTML 渲染测试：</strong>可以在左侧编辑 Markdown 内容，右侧实时预览渲染效果</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DemoIndex
