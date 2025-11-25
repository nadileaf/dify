'use client'
import {
  useEffect,
} from 'react'
// import { useTranslation } from 'react-i18next'
import {
  EmbeddedChatbotContext,
  useEmbeddedChatbotContext,
} from './context'
import { useEmbeddedChatbot } from './hooks'
import { useThemeContext } from './theme/theme-context'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import Loading from '@/app/components/base/loading'
// import LogoHeader from '@/app/components/base/logo/logo-embedded-chat-header'
import Header from '@/app/components/base/chat/embedded-chatbot/header'
import ChatWrapper from '@/app/components/base/chat/embedded-chatbot/chat-wrapper'
import cn from '@/utils/classnames'
import useDocumentTitle from '@/hooks/use-document-title'
// import { useGlobalPublicStore } from '@/context/global-public-context'

const Chatbot = () => {
  const {
    isMobile,
    allowResetChat,
    appData,
    appChatListDataLoading,
    chatShouldReloadKey,
    handleNewConversation,
    themeBuilder,
    currentConversationId,
    hideTitle,
    backgroundColor,
  } = useEmbeddedChatbotContext()
  // const { t } = useTranslation()
  // const systemFeatures = useGlobalPublicStore(s => s.systemFeatures)

  const customConfig = appData?.custom_config
  const site = appData?.site

  // const difyIcon = <LogoHeader />

  useEffect(() => {
    themeBuilder?.buildTheme(site?.chat_color_theme, site?.chat_color_theme_inverted)
  }, [site, customConfig, themeBuilder])

  useDocumentTitle(site?.title || 'Chat')

  const bgStyle = backgroundColor
    ? { backgroundColor }
    : undefined

  const bgClassName = backgroundColor
    ? undefined
    : (currentConversationId ? 'bg-white' : 'bg-gradient-to-b from-[#F6F5F2] to-[#F7F5F2]')

  return (
    <div className={cn('relative z-[1]', bgClassName)} style={bgStyle}>
      {!currentConversationId && !backgroundColor && <div className='absolute inset-0 z-[-1] bg-[url(https://cdn-fe.mesoor.com/chat/chat-main-background.jpg)] bg-cover bg-center opacity-80' />}
      <div
        className={cn(
          'flex flex-col border border-components-panel-border-subtle', 'h-[100vh] ',
        )}
      >
        {!hideTitle && (
          <Header
            isMobile={isMobile}
            allowResetChat={allowResetChat}
            title={site?.title || ''}
            theme={themeBuilder?.theme}
            onCreateNewChat={handleNewConversation}
          />
        )}
        <div className={cn('flex grow flex-col overflow-y-auto')}>
          {appChatListDataLoading && (
            <Loading type='app' />
          )}
          {!appChatListDataLoading && (
            <ChatWrapper key={chatShouldReloadKey} />
          )}
        </div>
      </div>

    </div>
  )
}

export type EmbeddedChatbotWrapperProps = {
  initialPrompt?: string
  hideTitle?: boolean
  backgroundColor?: string
}

const EmbeddedChatbotWrapper = ({ initialPrompt, hideTitle, backgroundColor }: EmbeddedChatbotWrapperProps) => {
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile
  const themeBuilder = useThemeContext()

  const {
    appData,
    userCanAccess,
    appParams,
    appMeta,
    appChatListDataLoading,
    currentConversationId,
    currentConversationItem,
    appPrevChatList,
    pinnedConversationList,
    conversationList,
    newConversationInputs,
    newConversationInputsRef,
    handleNewConversationInputsChange,
    inputsForms,
    handleNewConversation,
    handleStartChat,
    handleChangeConversation,
    handleNewConversationCompleted,
    chatShouldReloadKey,
    isInstalledApp,
    allowResetChat,
    appId,
    handleFeedback,
    currentChatInstanceRef,
    clearChatList,
    setClearChatList,
    isResponding,
    setIsResponding,
    currentConversationInputs,
    setCurrentConversationInputs,
    allInputsHidden,
    initUserVariables,
  } = useEmbeddedChatbot()

  return <EmbeddedChatbotContext.Provider value={{
    userCanAccess,
    appData,
    appParams,
    appMeta,
    appChatListDataLoading,
    currentConversationId,
    currentConversationItem,
    appPrevChatList,
    pinnedConversationList,
    conversationList,
    newConversationInputs,
    newConversationInputsRef,
    handleNewConversationInputsChange,
    inputsForms,
    handleNewConversation,
    handleStartChat,
    handleChangeConversation,
    handleNewConversationCompleted,
    chatShouldReloadKey,
    isMobile,
    isInstalledApp,
    allowResetChat,
    appId,
    handleFeedback,
    currentChatInstanceRef,
    themeBuilder,
    clearChatList,
    setClearChatList,
    isResponding,
    setIsResponding,
    currentConversationInputs,
    setCurrentConversationInputs,
    allInputsHidden,
    initUserVariables,
    initialPrompt,
    hideTitle,
    backgroundColor,
  }}>
    <Chatbot />
  </EmbeddedChatbotContext.Provider>
}

const EmbeddedChatbot = ({ initialPrompt, hideTitle, backgroundColor }: EmbeddedChatbotWrapperProps = {}) => {
  return <EmbeddedChatbotWrapper
    initialPrompt={initialPrompt}
    hideTitle={hideTitle}
    backgroundColor={backgroundColor}
  />
}

export default EmbeddedChatbot
