/**
 * Chat Input Area with Entity Tags Support
 * 集成实体标签功能的输入框包装组件
 */

'use client'
import type { FC } from 'react'
import { useMemo } from 'react'
import type { OnSend } from '../types'
import type { Theme } from '../embedded-chatbot/theme/theme-context'
import type { InputForm } from '../chat/type'
import ChatInputArea from '../chat/chat-input-area'
import { EntityTags, useEntityTags } from './index'
import type { FileUpload } from '@/app/components/base/features/types'
import type { EnableType } from '@/app/components/base/chat/types'

type ChatInputWithTagsProps = {
  readonly?: boolean;
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
  sendOnEnter?: boolean;
}

export const ChatInputWithTags: FC<ChatInputWithTagsProps> = (props) => {
  const { entityTags, removeTag, clearTags, tagsToText }
    = useEntityTags()

  const handleSend = useMemo(() => {
    if (!props.onSend) {
      return () => {
        /* noop */
      }
    }

    return (message: string, files: any[]) => {
      const tagsText = tagsToText(entityTags)
      const finalMessage = tagsText ? `${tagsText} ${message}` : message

      props.onSend!(finalMessage, files)

      clearTags()
    }
  }, [props.onSend, entityTags, tagsToText, clearTags])

  if (entityTags.length === 0) {
    return (
      <ChatInputArea
        {...props}
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
          onSend={handleSend as OnSend}
        />
      </div>
    </div>
  )
}

export default ChatInputWithTags
