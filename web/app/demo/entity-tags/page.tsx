'use client'

import { RiAddLine, RiCloseLine, RiSendPlaneFill } from '@remixicon/react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { getChatbotToken } from '../config'

type EntityTag = {
  icon?: string
  label?: string
  value: string
}

const EntityTagsDemo = () => {
  const [chatbotToken, setChatbotToken] = useState('')

  useEffect(() => {
    setChatbotToken(getChatbotToken())
  }, [])
  const [entityTags, setEntityTags] = useState<EntityTag[]>([
    { icon: '👤', label: '张三', value: 'user_3391' },
  ])
  const [copySuccess, setCopySuccess] = useState('')

  const addEntityTag = () => {
    setEntityTags([...entityTags, { icon: '', label: '', value: '' }])
  }

  const removeEntityTag = (index: number) => {
    setEntityTags(entityTags.filter((_, i) => i !== index))
  }

  const updateEntityTag = (index: number, field: keyof EntityTag, value: string) => {
    const newTags = [...entityTags]
    newTags[index] = { ...newTags[index], [field]: value }
    setEntityTags(newTags)
  }

  const sendEntityTags = () => {
    const iframe = document.getElementById('chatbot-iframe') as HTMLIFrameElement
    if (iframe && iframe.contentWindow) {
      const validTags = entityTags.filter(tag => tag.value)
      if (validTags.length === 0) {
        setCopySuccess('❌ 至少需要一个有效的标签（value必填）')
        setTimeout(() => setCopySuccess(''), 2000)
        return
      }

      iframe.contentWindow.postMessage({
        type: 'dify-add-entity-tags',
        payload: {
          tags: validTags,
        },
      }, '*')

      setCopySuccess(`✅ 已发送 ${validTags.length} 个实体标签`)
      setTimeout(() => setCopySuccess(''), 2000)
    }
  }

  const presetEntityTags = [
    {
      name: '单个用户',
      tags: [{ icon: '👤', label: '张三', value: 'user_3391' }],
    },
    {
      name: '多个用户',
      tags: [
        { icon: '👤', label: '张三', value: 'user_3391' },
        { icon: '👤', label: '李四', value: 'user_4521' },
      ],
    },
    {
      name: '订单信息',
      tags: [{ icon: '📦', label: '订单 123456', value: 'order_123456' }],
    },
    {
      name: '产品列表',
      tags: [
        { icon: '🛍️', label: '产品 A', value: 'product_a001' },
        { icon: '🛍️', label: '产品 B', value: 'product_b002' },
      ],
    },
    {
      name: '混合场景',
      tags: [
        { icon: '👤', label: '王五', value: 'user_5678' },
        { icon: '📦', label: '订单 789', value: 'order_789' },
        { icon: '🛍️', label: '产品 C', value: 'product_c003' },
      ],
    },
    {
      name: '图片图标',
      tags: [
        { icon: 'https://avatar.vercel.sh/user1', label: 'Alice', value: 'user_alice' },
        { icon: 'https://avatar.vercel.sh/user2', label: 'Bob', value: 'user_bob' },
      ],
    },
    {
      name: '仅value（无icon/label）',
      tags: [{ value: 'raw_data_12345' }],
    },
  ]

  const sendPresetTags = (tags: EntityTag[]) => {
    const iframe = document.getElementById('chatbot-iframe') as HTMLIFrameElement
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'dify-add-entity-tags',
        payload: { tags },
      }, '*')

      setCopySuccess('✅ 已发送预设标签')
      setTimeout(() => setCopySuccess(''), 2000)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">实体标签功能测试</h1>
            <p className="mt-1 text-sm text-gray-500">
              通过 postMessage 向 Chatbot 发送实体标签
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Chatbot Token:</label>
              <input
                type="text"
                value={chatbotToken}
                onChange={e => setChatbotToken(e.target.value)}
                className="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="输入 token"
              />
              <button
                type="button"
                onClick={() => setChatbotToken(getChatbotToken())}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                title="重置为默认"
              >
                重置
              </button>
            </div>
            <a
              href="/demo"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
            >
              返回首页
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden p-6">
        <div className="flex w-[450px] flex-col gap-4 overflow-y-auto">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                1
              </span>
              自定义实体标签
            </h2>

            <div className="space-y-3">
              {entityTags.map((tag, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Icon"
                    value={tag.icon}
                    onChange={e => updateEntityTag(index, 'icon', e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Label"
                    value={tag.label}
                    onChange={e => updateEntityTag(index, 'label', e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Value (必填)"
                    value={tag.value}
                    onChange={e => updateEntityTag(index, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeEntityTag(index)}
                    className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                  >
                    <RiCloseLine className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addEntityTag}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              <RiAddLine className="h-4 w-4" />
              添加实体标签
            </button>

            <button
              type="button"
              onClick={sendEntityTags}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
            >
              <RiSendPlaneFill className="h-4 w-4" />
              发送实体标签到 Chatbot
            </button>

            {copySuccess && (
              <div
                className={`mt-3 rounded-lg px-4 py-2 text-center text-sm ${
                  copySuccess.startsWith('✅')
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {copySuccess}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
                2
              </span>
              预设实体标签
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {presetEntityTags.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => sendPresetTags(preset.tags)}
                  className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-4 py-3 text-left text-sm shadow-sm transition-all hover:border-purple-300 hover:shadow-md"
                >
                  <div className="font-semibold text-gray-800">{preset.name}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {preset.tags.length}
                    {' '}
                    个标签
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="mb-2 font-semibold text-amber-900">💡 使用说明</h3>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>
                •
                <strong>Icon</strong>
                ：可选，支持 Emoji（如 👤、📦）或图片 URL
              </li>
              <li>
                •
                <strong>Label</strong>
                ：可选，标签显示的文本
              </li>
              <li>
                •
                <strong>Value</strong>
                ：必填，发送给大模型的实际值
              </li>
              <li>• 标签会显示在 Chatbot 输入框上方</li>
              <li>
                • 发送消息时转换为 Markdown 链接：
                <code className="rounded bg-amber-100 px-1">[Label](Value)</code>
              </li>
              <li>• 图片 URL 支持 http/https/data:image 格式</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <iframe
            id="chatbot-iframe"
            src={`/chatbot/${chatbotToken}`}
            className="h-full w-full"
            title="Chatbot"
            key={chatbotToken}
          />
        </div>
      </div>
    </div>
  )
}

export default EntityTagsDemo
