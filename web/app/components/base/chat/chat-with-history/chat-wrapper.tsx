import { useCallback, useEffect, useMemo } from 'react'
import Chat from '../chat'
import type {
  ChatConfig,
  ChatItem,
  ChatItemInTree,
  OnSend,
} from '../types'
import { useChat } from '../chat/hooks'
import { getLastAnswer, isValidGeneratedAnswer } from '../utils'
import { useChatWithHistoryContext } from './context'
import { InputVarType } from '@/app/components/workflow/types'
import { TransferMethod } from '@/types/app'
import {
  fetchSuggestedQuestions,
  getUrl,
  stopChatMessageResponding,
} from '@/service/share'
import AnswerIcon from '@/app/components/base/answer-icon'
import SuggestedQuestions from '@/app/components/base/chat/chat/answer/suggested-questions'
import { Markdown } from '@/app/components/base/markdown'
import type { FileEntity } from '../../file-uploader/types'
import { formatBooleanInputs } from '@/utils/model-config'
import Avatar from '../../avatar'
import ChatInputArea from '../chat/chat-input-area'
import BgMascot from './bg-mascot'

const ChatWrapper = () => {
  const {
    appParams,
    appPrevChatTree,
    currentConversationId,
    currentConversationItem,
    currentConversationInputs,
    inputsForms,
    newConversationInputs,
    newConversationInputsRef,
    handleNewConversationCompleted,
    isMobile,
    isInstalledApp,
    appId,
    appMeta,
    handleFeedback,
    currentChatInstanceRef,
    appData,
    themeBuilder,
    sidebarCollapseState,
    clearChatList,
    setClearChatList,
    setIsResponding,
    allInputsHidden,
    initUserVariables,
  } = useChatWithHistoryContext()

  // Semantic variable for better code readability
  const isHistoryConversation = !!currentConversationId

  const appConfig = useMemo(() => {
    const config = appParams || {}

    return {
      ...config,
      file_upload: {
        ...(config as any).file_upload,
        fileUploadConfig: (config as any).system_parameters,
      },
      supportFeedback: true,
      opening_statement: isHistoryConversation ? currentConversationItem?.introduction : (config as any).opening_statement,
    } as ChatConfig
  }, [appParams, currentConversationItem?.introduction, isHistoryConversation])
  const {
    chatList,
    setTargetMessageId,
    handleSend,
    handleStop,
    isResponding: respondingState,
    suggestedQuestions,
  } = useChat(
    appConfig,
    {
      inputs: (isHistoryConversation ? currentConversationInputs : newConversationInputs) as any,
      inputsForm: inputsForms,
    },
    appPrevChatTree,
    taskId => stopChatMessageResponding('', taskId, isInstalledApp, appId),
    clearChatList,
    setClearChatList,
  )
  const inputsFormValue = isHistoryConversation ? currentConversationInputs : newConversationInputsRef?.current
  const inputDisabled = useMemo(() => {
    if (allInputsHidden)
      return false

    let hasEmptyInput = ''
    let fileIsUploading = false
    const requiredVars = inputsForms.filter(({ required, type }) => required && type !== InputVarType.checkbox)
    if (requiredVars.length) {
      requiredVars.forEach(({ variable, label, type }) => {
        if (hasEmptyInput)
          return

        if (fileIsUploading)
          return

        if (!inputsFormValue?.[variable])
          hasEmptyInput = label as string

        if ((type === InputVarType.singleFile || type === InputVarType.multiFiles) && inputsFormValue?.[variable]) {
          const files = inputsFormValue[variable]
          if (Array.isArray(files))
            fileIsUploading = files.find(item => item.transferMethod === TransferMethod.local_file && !item.uploadedId)
          else
            fileIsUploading = files.transferMethod === TransferMethod.local_file && !files.uploadedId
        }
      })
    }
    return !!(hasEmptyInput || fileIsUploading)
  }, [inputsFormValue, inputsForms, allInputsHidden])

  useEffect(() => {
    if (currentChatInstanceRef.current)
      currentChatInstanceRef.current.handleStop = handleStop
  }, [])

  useEffect(() => {
    setIsResponding(respondingState)
  }, [respondingState, setIsResponding])

  const doSend: OnSend = useCallback((message, files, isRegenerate = false, parentAnswer: ChatItem | null = null) => {
    const data: any = {
      query: message,
      files,
      inputs: formatBooleanInputs(inputsForms, isHistoryConversation ? currentConversationInputs : newConversationInputs),
      conversation_id: currentConversationId,
      parent_message_id: (isRegenerate ? parentAnswer?.id : getLastAnswer(chatList)?.id) || null,
    }

    handleSend(
      getUrl('chat-messages', isInstalledApp, appId || ''),
      data,
      {
        onGetSuggestedQuestions: responseItemId => fetchSuggestedQuestions(responseItemId, isInstalledApp, appId),
        onConversationComplete: isHistoryConversation ? undefined : handleNewConversationCompleted,
        isPublicAPI: !isInstalledApp,
      },
    )
  }, [chatList, handleNewConversationCompleted, handleSend, isHistoryConversation, currentConversationInputs, newConversationInputs, isInstalledApp, appId])

  const doRegenerate = useCallback((chatItem: ChatItemInTree, editedQuestion?: { message: string, files?: FileEntity[] }) => {
    const question = editedQuestion ? chatItem : chatList.find(item => item.id === chatItem.parentMessageId)!
    const parentAnswer = chatList.find(item => item.id === question.parentMessageId)
    doSend(editedQuestion ? editedQuestion.message : question.content,
      editedQuestion ? editedQuestion.files : question.message_files,
      true,
      isValidGeneratedAnswer(parentAnswer) ? parentAnswer : null,
    )
  }, [chatList, doSend])

  const messageList = useMemo(() => {
    // Always filter out opening statement from message list as it's handled separately in welcome component
    return chatList.filter(item => !item.isOpeningStatement)
  }, [chatList])

  const welcome = useMemo(() => {
    const welcomeMessage = chatList.find(item => item.isOpeningStatement)
    if (respondingState)
      return null
    if (isHistoryConversation)
      return null

    return (
      <div className='flex min-h-[90%] items-center justify-center px-4 py-12'>
        <div className='relative flex max-w-[800px] grow gap-4'>
          <div className='w-0 grow'>
            <BgMascot url={appData?.site.icon_url || ''} />
            <div className='body-lg-regular grow rounded-2xl px-4 py-3 text-text-primary'>
              <Markdown content={welcomeMessage?.content || `${appData?.site.title || 'Bot'}，从这里开始你的旅程吧！`} className='!text-center !text-3xl  max-sm:!text-xl' />
              <div className='my-10'>
                <ChatInputArea
                  botName={appData?.site.title || 'Bot'}
                  disabled={inputDisabled}
                  showFeatureBar={false}
                  showFileUpload={false}
                  featureBarDisabled={respondingState}
                  visionConfig={appConfig?.file_upload}
                  speechToTextConfig={appConfig?.speech_to_text}
                  onSend={doSend}
                  inputs={currentConversationId ? currentConversationInputs as any : newConversationInputs}
                  inputsForm={inputsForms}
                  theme={themeBuilder?.theme}
                  isResponding={respondingState}
                  minRows={4}
                  autoFocus={false}
                  suggestedQuestions={welcomeMessage?.suggestedQuestions}
                  webAppDescription={appData?.site.description}
                />
              </div>
              {welcomeMessage?.suggestedQuestions && welcomeMessage?.suggestedQuestions?.length > 0 && <SuggestedQuestions item={welcomeMessage} isWelcome />}
            </div>
          </div>
        </div>
      </div>
    )
  }, [appData?.site.title, chatList, currentConversationId, respondingState])

  const answerIcon = (appData?.site && appData.site.use_icon_as_answer_icon)
    ? <AnswerIcon
      iconType={appData.site.icon_type}
      icon={appData.site.icon}
      background={appData.site.icon_background}
      imageUrl={appData.site.icon_url}
    />
    : null

  return (
    <div
      className='h-full overflow-hidden'
    >
      <Chat
        appData={appData ?? undefined}
        config={appConfig}
        chatList={messageList}
        isResponding={respondingState}
        chatContainerInnerClassName={`mx-auto pt-6 w-full max-w-[768px] ${isMobile && 'px-4'}`}
        chatFooterClassName='pb-4'
        chatFooterInnerClassName={`mx-auto w-full max-w-[768px] ${isMobile ? 'px-2' : 'px-4'}`}
        onSend={doSend}
        inputs={isHistoryConversation ? currentConversationInputs as any : newConversationInputs}
        inputsForm={inputsForms}
        onRegenerate={doRegenerate}
        onStopResponding={handleStop}
        chatNode={
          <>
            {welcome}
          </>
        }
        allToolIcons={appMeta?.tool_icons || {}}
        onFeedback={handleFeedback}
        suggestedQuestions={suggestedQuestions}
        answerIcon={answerIcon}
        hideProcessDetail
        themeBuilder={themeBuilder}
        switchSibling={siblingMessageId => setTargetMessageId(siblingMessageId)}
        inputDisabled={inputDisabled}
        isMobile={isMobile}
        sidebarCollapseState={sidebarCollapseState}
        questionIcon={
          initUserVariables?.avatar_url
            ? <Avatar
              avatar={initUserVariables.avatar_url}
              name={initUserVariables.name || 'user'}
              size={40}
            /> : undefined
        }
        noChatInput={!currentConversationId}
      />
    </div>
  )
}

export default ChatWrapper
