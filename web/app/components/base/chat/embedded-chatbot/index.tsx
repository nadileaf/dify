'use client'
import type { AppData } from '@/models/share'
import {
  useEffect,
} from 'react'
import { useTranslation } from 'react-i18next'
import ChatWrapper from '@/app/components/base/chat/embedded-chatbot/chat-wrapper'
import Header from '@/app/components/base/chat/embedded-chatbot/header'
import Loading from '@/app/components/base/loading'
import DifyLogo from '@/app/components/base/logo/dify-logo'
import LogoHeader from '@/app/components/base/logo/logo-embedded-chat-header'
import { useGlobalPublicStore } from '@/context/global-public-context'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import useDocumentTitle from '@/hooks/use-document-title'
import { AppSourceType } from '@/service/share'
import { cn } from '@/utils/classnames'
import {
  EmbeddedChatbotContext,
  useEmbeddedChatbotContext,
} from './context'
import { useEmbeddedChatbot } from './hooks'
import { useThemeContext } from './theme/theme-context'
import { isDify } from './utils'

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
  const { t } = useTranslation()
  const systemFeatures = useGlobalPublicStore(s => s.systemFeatures)

  const customConfig = appData?.custom_config
  const site = appData?.site

  const difyIcon = <LogoHeader />

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
      {!currentConversationId && !backgroundColor && <div className="absolute inset-0 z-[-1] bg-[url(https://cdn-fe.mesoor.com/chat/chat-main-background.jpg)] bg-cover bg-center opacity-80" />}
      <div
        className={cn(
          'flex flex-col rounded-2xl',
          isMobile ? 'h-[calc(100vh_-_60px)] shadow-xs' : 'h-[100vh] bg-chatbot-bg',
        )}
      >
        {!hideTitle && (
          <Header
            isMobile={isMobile}
            allowResetChat={allowResetChat}
            title={site?.title || ''}
            customerIcon={isDify() ? difyIcon : ''}
            theme={themeBuilder?.theme}
            onCreateNewChat={handleNewConversation}
          />
        )}
        <div className={cn('flex grow flex-col overflow-y-auto', isMobile && 'm-[0.5px] !h-[calc(100vh_-_3rem)] rounded-2xl bg-chatbot-bg')}>

          {appChatListDataLoading && (
            <Loading type="app" />
          )}
          {!appChatListDataLoading && (
            <ChatWrapper key={chatShouldReloadKey} />
          )}
        </div>
      </div>
      {isMobile && (
        <div className="flex h-[60px] shrink-0 items-center pl-2">
          {!appData?.custom_config?.remove_webapp_brand && (
            <div className={cn(
              'flex shrink-0 items-center gap-1.5 px-2',
            )}
            >
              <div className="system-2xs-medium-uppercase text-text-tertiary">{t('chat.poweredBy', { ns: 'share' })}</div>
              {
                systemFeatures.branding.enabled && systemFeatures.branding.workspace_logo
                  ? <img src={systemFeatures.branding.workspace_logo} alt="logo" className="block h-5 w-auto" />
                  : appData?.custom_config?.replace_webapp_logo
                    ? <img src={`${appData?.custom_config?.replace_webapp_logo}`} alt="logo" className="block h-5 w-auto" />
                    : <DifyLogo size="small" />
              }
            </div>
          )}
        </div>
      )}
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
  } = useEmbeddedChatbot(AppSourceType.webApp)

  return (
    <EmbeddedChatbotContext.Provider value={{
      appSourceType: AppSourceType.webApp,
      appData: (appData as AppData) || null,
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
    }}
    >
      <Chatbot />
    </EmbeddedChatbotContext.Provider>
  )
}

const EmbeddedChatbot = ({ initialPrompt, hideTitle, backgroundColor }: EmbeddedChatbotWrapperProps = {}) => {
  return (
    <EmbeddedChatbotWrapper
      initialPrompt={initialPrompt}
      hideTitle={hideTitle}
      backgroundColor={backgroundColor}
    />
  )
}

export default EmbeddedChatbot
