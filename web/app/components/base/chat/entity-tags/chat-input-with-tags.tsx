/**
 * Chat Input Area with Entity Tags Support
 * 集成实体标签功能的输入框包装组件
 */

'use client'
import type { FC } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { OnSend } from '../types'
import type { Theme } from '../embedded-chatbot/theme/theme-context'
import type { InputForm } from '../chat/type'
import ChatInputArea from '../chat/chat-input-area'
import { EntityTags, useEntityTags } from './index'
import type { FileUpload } from '@/app/components/base/features/types'
import type { EnableType } from '@/app/components/base/chat/types'

type ChatInputWithTagsProps = {
  botName?: string;
  showFeatureBar?: boolean;
  showFileUpload?: boolean;
  featureBarDisabled?: boolean;
  onFeatureBarClick?: (state: boolean) => void;
  visionConfig?: FileUpload;
  speechToTextConfig?: EnableType;
  onSend?: OnSend;
  inputs?: Record<string, any>;
  inputsForm?: InputForm[];
  theme?: Theme | null;
  isResponding?: boolean;
  disabled?: boolean;
  minRows?: number;
  autoFocus?: boolean;
  suggestedQuestions?: string[];
  webAppDescription?: string;
  initialValue?: string;
}

export const ChatInputWithTags: FC<ChatInputWithTagsProps> = (props) => {
  // 受控输入框值
  const [inputValue, setInputValue] = useState(props.initialValue || '')

  // 同步外部 initialValue 变化（不覆盖用户输入）
  useEffect(() => {
    if (props.initialValue !== undefined && props.initialValue !== inputValue)
      setInputValue(props.initialValue)
  }, [props.initialValue])

  const { entityTags, removeTag, clearTags, tagsToText }
    = useEntityTags()

  // 包装 onSend 函数，在发送前添加标签文本
  const handleSend = useMemo(() => {
    if (!props.onSend) {
      return () => {
        /* noop */
      }
    }

    return (message: string, files: any[]) => {
      // 将标签转换为 Markdown 链接格式并添加到消息前面
      const tagsText = tagsToText(entityTags)
      const finalMessage = tagsText ? `${tagsText} ${message}` : message

      // 调用原始 onSend
      props.onSend!(finalMessage, files)

      // 发送后清空标签和输入框
      clearTags()
      setInputValue('')
    }
  }, [props.onSend, entityTags, tagsToText, clearTags])

  if (entityTags.length === 0) {
    return (
      <ChatInputArea
        {...props}
        initialValue={inputValue}
        onSend={handleSend as OnSend}
      />
    )
  }

  return (
    <div className="relative rounded-xl border border-components-chat-input-border bg-components-panel-bg-blur shadow-md transition-all">
      <EntityTags tags={entityTags} onRemoveTag={removeTag} size="sm" />
      <div className="[&>div]:rounded-none [&>div]:!border-0 [&>div]:bg-transparent [&>div]:!shadow-none">
        <ChatInputArea
          {...props}
          initialValue={inputValue}
          onSend={handleSend as OnSend}
        />
      </div>
    </div>
  )
}

export default ChatInputWithTags
