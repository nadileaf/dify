import type { FC } from 'react'
import React, { useCallback, useEffect, useState } from 'react'
import {
  RiCollapseDiagonal2Line,
  RiExpandDiagonal2Line,
  RiResetLeftLine,
} from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import type { Theme } from '../theme/theme-context'
import { useEmbeddedChatbotContext } from '../context'
import Tooltip from '@/app/components/base/tooltip'
import ActionButton from '@/app/components/base/action-button'
import ViewFormDropdown from '@/app/components/base/chat/embedded-chatbot/inputs-form/view-form-dropdown'
// import { useGlobalPublicStore } from '@/context/global-public-context'
import { Image } from '@heroui/react'

export type IHeaderProps = {
  isMobile?: boolean;
  allowResetChat?: boolean;
  customerIcon?: React.ReactNode;
  title: string;
  theme?: Theme;
  onCreateNewChat?: () => void;
}
const Header: FC<IHeaderProps> = ({
  isMobile,
  allowResetChat,
  customerIcon,
  title,
  theme,
  onCreateNewChat,
}) => {
  const { t } = useTranslation()
  const { appData, currentConversationId, inputsForms }
    = useEmbeddedChatbotContext()

  const isClient = typeof window !== 'undefined'
  const isIframe = isClient ? window.self !== window.top : false
  const [parentOrigin, setParentOrigin] = useState('')
  const [showToggleExpandButton, setShowToggleExpandButton] = useState(false)
  const [expanded, setExpanded] = useState(false)
  // const systemFeatures = useGlobalPublicStore(s => s.systemFeatures)

  const handleMessageReceived = useCallback(
    (event: MessageEvent) => {
      let currentParentOrigin = parentOrigin
      if (!currentParentOrigin && event.data.type === 'dify-chatbot-config') {
        currentParentOrigin = event.origin
        setParentOrigin(event.origin)
      }
      if (event.origin !== currentParentOrigin) return
      if (event.data.type === 'dify-chatbot-config') {
        setShowToggleExpandButton(
          event.data.payload.isToggledByButton
            && !event.data.payload.isDraggable,
        )
      }
    },
    [parentOrigin],
  )

  useEffect(() => {
    if (!isIframe) return

    const listener = (event: MessageEvent) => handleMessageReceived(event)
    window.addEventListener('message', listener)

    window.parent.postMessage({ type: 'dify-chatbot-iframe-ready' }, '*')

    return () => window.removeEventListener('message', listener)
  }, [isIframe, handleMessageReceived])

  const handleToggleExpand = useCallback(() => {
    if (!isIframe || !showToggleExpandButton) return
    setExpanded(!expanded)
    window.parent.postMessage(
      {
        type: 'dify-chatbot-expand-change',
      },
      parentOrigin,
    )
  }, [isIframe, parentOrigin, showToggleExpandButton, expanded])

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-divider-subtle p-3">
      <div
        className="system-md-semibold flex items-center gap-1 truncate"
      >
        <Image
          src={appData?.site.icon_url || ''}
          alt={title}
          width={24}
          height={24}
          radius='md'
        />
        {title}
      </div>
      <div className="flex items-center gap-1">

        {showToggleExpandButton && (
          <Tooltip
            popupContent={
              expanded ? t('share.chat.collapse') : t('share.chat.expand')
            }
          >
            <ActionButton size="l" onClick={handleToggleExpand}>
              {expanded ? (
                <RiCollapseDiagonal2Line className="h-[18px] w-[18px]" />
              ) : (
                <RiExpandDiagonal2Line className="h-[18px] w-[18px]" />
              )}
            </ActionButton>
          </Tooltip>
        )}
        {currentConversationId && allowResetChat && (
          <Tooltip popupContent={t('share.chat.resetChat')}>
            <ActionButton size="l" onClick={onCreateNewChat}>
              <RiResetLeftLine className="h-[18px] w-[18px]" />
            </ActionButton>
          </Tooltip>
        )}
        {currentConversationId && inputsForms.length > 0 && (
          <ViewFormDropdown />
        )}
      </div>
    </div>
  )
}

export default React.memo(Header)
