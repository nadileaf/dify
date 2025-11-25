/**
 * Chat Input Area with Entity Tags Support
 * 集成实体标签功能的输入框包装组件
 */

'use client'
import type { FC } from 'react'
import { useEffect, useMemo } from 'react'
import type { OnSend } from '../types'
import type { Theme } from '../embedded-chatbot/theme/theme-context'
import type { InputForm } from '../chat/type'
import ChatInputArea from '../chat/chat-input-area'
import { EntityTags, useEntityTags } from './index'
import type { FileUpload } from '@/app/components/base/features/types'
import type { EnableType } from '@/app/components/base/chat/types'

type ChatInputWithTagsProps = {
  botName?: string
  showFeatureBar?: boolean
  showFileUpload?: boolean
  featureBarDisabled?: boolean
  onFeatureBarClick?: (state: boolean) => void
  visionConfig?: FileUpload
  speechToTextConfig?: EnableType
  onSend?: OnSend
  inputs?: Record<string, any>
  inputsForm?: InputForm[]
  theme?: Theme | null
  isResponding?: boolean
  disabled?: boolean
  minRows?: number
  autoFocus?: boolean
  suggestedQuestions?: string[]
  webAppDescription?: string
  initialValue?: string
}

export const ChatInputWithTags: FC<ChatInputWithTagsProps> = (props) => {
  const {
    entityTags,
    removeTag,
    clearTags,
    tagsToText,
  } = useEntityTags()

  // 包装 onSend 函数，在发送前添加标签文本
  const handleSend: OnSend = useMemo(() => {
    if (!props.onSend)
      return () => { /* noop */ }

    return (message: string, files: any[]) => {
      // 将标签转换为文本并添加到消息前面
      const tagsText = tagsToText(entityTags)
      const finalMessage = tagsText ? `${tagsText} ${message}` : message

      // 调用原始 onSend
      props.onSend!(finalMessage, files)

      // 发送后清空标签
      clearTags()
    }
  }, [props.onSend, entityTags, tagsToText, clearTags])

  // 如果消息被清空（比如发送后），也清空标签
  useEffect(() => {
    if (!props.initialValue && entityTags.length > 0) {
      // 这里可以根据需要决定是否清空标签
    }
  }, [props.initialValue, entityTags.length])

  if (entityTags.length === 0) {
    return (
      <ChatInputArea
        {...props}
        onSend={handleSend}
      />
    )
  }

  return (
    <div className="relative rounded-xl border border-components-chat-input-border bg-components-panel-bg-blur shadow-md transition-all">
      <EntityTags
        tags={entityTags}
        onRemoveTag={removeTag}
        size="sm"
      />
      <div className="[&>div]:rounded-none [&>div]:!border-0 [&>div]:bg-transparent [&>div]:!shadow-none">
        <ChatInputArea
          {...props}
          onSend={handleSend}
        />
      </div>
    </div>
  )
}

export default ChatInputWithTags
