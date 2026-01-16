/**
 * Chat Input Area with Entity Tags Support
 * 集成实体标签功能的输入框包装组件
 */

'use client'
import type { FC } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
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

  // 当标签被添加时，将 [label] 文本插入输入框
  const handleTagsAdded = useCallback((tagsText: string) => {
    setInputValue((prev) => {
      // 如果输入框有内容且不以空格结尾，加空格分隔
      if (prev && !prev.endsWith(' ')) return `${prev} ${tagsText} `
      return `${prev}${tagsText} `
    })
  }, [])

  const { entityTags, removeTag, clearTags, tagsToText, tagToInputText }
    = useEntityTags({ onTagsAdded: handleTagsAdded })

  // 删除标签时，也从输入框中移除对应的 [label] 文本
  const handleRemoveTag = useCallback(
    (id: string) => {
      const tagToRemove = entityTags.find(t => t.id === id)
      if (tagToRemove) {
        const tagText = tagToInputText({
          label: tagToRemove.label,
          value: tagToRemove.value,
          icon: tagToRemove.icon,
        })
        setInputValue((prev) => {
          // 移除标签文本（包括可能跟随的空格）
          const pattern = new RegExp(
            `\\s*${tagText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`,
            'g',
          )
          return prev.replace(pattern, ' ').trim()
        })
      }
      removeTag(id)
    },
    [entityTags, removeTag, tagToInputText],
  )

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
      <EntityTags tags={entityTags} onRemoveTag={handleRemoveTag} size="sm" />
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
