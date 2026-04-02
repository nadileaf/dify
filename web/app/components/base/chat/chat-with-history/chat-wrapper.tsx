import type { FileEntity } from '../../file-uploader/types'
import type {
  ChatConfig,
  ChatItem,
  ChatItemInTree,
  OnSend,
} from '../types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AnswerIcon from '@/app/components/base/answer-icon'
import InputsForm from '@/app/components/base/chat/chat-with-history/inputs-form'
import SuggestedQuestions from '@/app/components/base/chat/chat/answer/suggested-questions'
import { Markdown } from '@/app/components/base/markdown'
import { InputVarType } from '@/app/components/workflow/types'
import {
  AppSourceType,
  fetchSuggestedQuestions,
  getUrl,
  stopChatMessageResponding,
  submitHumanInputForm,
} from '@/service/share'
import { submitHumanInputForm as submitHumanInputFormService } from '@/service/workflow'
import { TransferMethod } from '@/types/app'
import { formatBooleanInputs } from '@/utils/model-config'
import { Avatar } from '../../avatar'
import Chat from '../chat'
import ChatInputArea from '../chat/chat-input-area'
import { useChat } from '../chat/hooks'
import { getLastAnswer, isValidGeneratedAnswer } from '../utils'
import BgMascot from './bg-mascot'
import { useChatWithHistoryContext } from './context'

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
    initialPrompt,
    shouldStartNewConversation,
    handleNewConversation,
    resetNewConversationFlag,
    resetInitialPrompt,
  } = useChatWithHistoryContext()
  const [promptSent, setPromptSent] = useState(false)
  const newConversationTriggeredRef = useRef(false)

  const appSourceType = isInstalledApp ? AppSourceType.installedApp : AppSourceType.webApp

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
      opening_statement: currentConversationItem?.introduction || (config as any).opening_statement,
    } as ChatConfig
  }, [appParams, currentConversationItem?.introduction])
  const {
    chatList,
    handleSend,
    handleStop,
    handleSwitchSibling,
    isResponding: respondingState,
    suggestedQuestions,
  } = useChat(
    appConfig,
    {
      inputs: (currentConversationId ? currentConversationInputs : newConversationInputs) as any,
      inputsForm: inputsForms,
    },
    appPrevChatTree,
    taskId => stopChatMessageResponding('', taskId, appSourceType, appId),
    clearChatList,
    setClearChatList,
  )
  const inputsFormValue = currentConversationId ? currentConversationInputs : newConversationInputsRef?.current
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
    if (hasEmptyInput)
      return true

    if (fileIsUploading)
      return true

    if (chatList.some(item => item.isAnswer && item.humanInputFormDataList && item.humanInputFormDataList.length > 0))
      return true
    return false
  }, [allInputsHidden, inputsForms, chatList, inputsFormValue])

  useEffect(() => {
    if (currentChatInstanceRef.current)
      currentChatInstanceRef.current.handleStop = handleStop
  }, [])

  useEffect(() => {
    setIsResponding(respondingState)
  }, [respondingState, setIsResponding])

  // Resume paused workflows when chat history is loaded
  useEffect(() => {
    if (!appPrevChatTree || appPrevChatTree.length === 0)
      return

    // Find the last answer item with workflow_run_id that needs resumption (DFS - find deepest first)
    let lastPausedNode: ChatItemInTree | undefined
    const findLastPausedWorkflow = (nodes: ChatItemInTree[]) => {
      nodes.forEach((node) => {
        // DFS: recurse to children first
        if (node.children && node.children.length > 0)
          findLastPausedWorkflow(node.children)

        // Track the last node with humanInputFormDataList
        if (node.isAnswer && node.workflow_run_id && node.humanInputFormDataList && node.humanInputFormDataList.length > 0)
          lastPausedNode = node
      })
    }

    findLastPausedWorkflow(appPrevChatTree)

    // Only resume the last paused workflow
    if (lastPausedNode) {
      handleSwitchSibling(
        lastPausedNode.id,
        {
          onGetSuggestedQuestions: responseItemId => fetchSuggestedQuestions(responseItemId, appSourceType, appId),
          onConversationComplete: currentConversationId ? undefined : handleNewConversationCompleted,
          isPublicAPI: appSourceType === AppSourceType.webApp,
        },
      )
    }
  }, [])

  const doSend: OnSend = useCallback((message, files, isRegenerate = false, parentAnswer: ChatItem | null = null) => {
    const data: any = {
      query: message,
      files,
      inputs: formatBooleanInputs(inputsForms, currentConversationId ? currentConversationInputs : newConversationInputs),
      conversation_id: currentConversationId,
      parent_message_id: (isRegenerate ? parentAnswer?.id : getLastAnswer(chatList)?.id) || null,
    }

    handleSend(
      getUrl('chat-messages', appSourceType, appId || ''),
      data,
      {
        onGetSuggestedQuestions: responseItemId => fetchSuggestedQuestions(responseItemId, appSourceType, appId),
        onConversationComplete: isHistoryConversation ? undefined : handleNewConversationCompleted,
        isPublicAPI: appSourceType === AppSourceType.webApp,
      },
    )
  }, [inputsForms, currentConversationId, currentConversationInputs, newConversationInputs, chatList, handleSend, appSourceType, appId, isHistoryConversation, handleNewConversationCompleted])

  useEffect(() => {
    if (shouldStartNewConversation && !newConversationTriggeredRef.current) {
      newConversationTriggeredRef.current = true
      handleNewConversation()
      resetNewConversationFlag()
    }
  }, [shouldStartNewConversation, handleNewConversation, resetNewConversationFlag])

  useEffect(() => {
    if (initialPrompt && !promptSent && !respondingState && !inputDisabled) {
      const timer = setTimeout(() => {
        doSend(initialPrompt, [])
        setPromptSent(true)
        resetInitialPrompt()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [initialPrompt, promptSent, respondingState, inputDisabled, doSend, resetInitialPrompt])

  const doRegenerate = useCallback((chatItem: ChatItem, editedQuestion?: { message: string, files?: FileEntity[] }) => {
    const question = editedQuestion ? chatItem : chatList.find(item => item.id === chatItem.parentMessageId)!
    const parentAnswer = chatList.find(item => item.id === question.parentMessageId)
    doSend(editedQuestion ? editedQuestion.message : question.content, editedQuestion ? editedQuestion.files : question.message_files, true, isValidGeneratedAnswer(parentAnswer) ? parentAnswer : null)
  }, [chatList, doSend])

  const doSwitchSibling = useCallback((siblingMessageId: string) => {
    handleSwitchSibling(siblingMessageId, {
      onGetSuggestedQuestions: responseItemId => fetchSuggestedQuestions(responseItemId, appSourceType, appId),
      onConversationComplete: currentConversationId ? undefined : handleNewConversationCompleted,
      isPublicAPI: appSourceType === AppSourceType.webApp,
    })
  }, [handleSwitchSibling, currentConversationId, handleNewConversationCompleted, appSourceType, appId])

  const messageList = useMemo(() => {
    if (currentConversationId || chatList.length > 1)
      return chatList
    return chatList.filter(item => !item.isOpeningStatement)
  }, [chatList, currentConversationId])

  const handleSubmitHumanInputForm = useCallback(async (formToken: string, formData: any) => {
    if (isInstalledApp)
      await submitHumanInputFormService(formToken, formData)
    else
      await submitHumanInputForm(formToken, formData)
  }, [isInstalledApp])

  const [collapsed, setCollapsed] = useState(!!currentConversationId)

  const chatNode = useMemo(() => {
    if (allInputsHidden || !inputsForms.length)
      return null
    if (isMobile) {
      if (!currentConversationId)
        return <InputsForm collapsed={collapsed} setCollapsed={setCollapsed} />
      return null
    }
    else {
      return <InputsForm collapsed={collapsed} setCollapsed={setCollapsed} />
    }
  }, [
    inputsForms.length,
    isMobile,
    currentConversationId,
    collapsed,
    allInputsHidden,
  ])

  const welcome = useMemo(() => {
    const welcomeMessage = chatList.find(item => item.isOpeningStatement)
    if (respondingState)
      return null
    if (currentConversationId)
      return null
    if (initialPrompt && !promptSent)
      return null

    return (
      <div className="flex min-h-[90%] items-center justify-center px-4 py-12">
        <div className="relative flex max-w-[800px] grow gap-4">
          <div className="w-0 grow">
            <BgMascot url={appData?.site.icon_url || ''} />
            <div className="body-lg-regular grow rounded-2xl px-4 py-3 text-text-primary">
              <Markdown content={welcomeMessage?.content || `${appData?.site.title || 'Bot'}，从这里开始你的旅程吧！`} className="!text-center !text-3xl max-sm:!text-xl" />
              <div className="my-10">
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
  }, [appData?.site.title, appData?.site.icon_url, appData?.site.description, chatList, currentConversationId, respondingState, initialPrompt, promptSent, inputDisabled, appConfig, doSend, currentConversationInputs, newConversationInputs, inputsForms, themeBuilder])

  const answerIcon = (appData?.site && appData.site.use_icon_as_answer_icon)
    ? (
        <AnswerIcon
          iconType={appData.site.icon_type}
          icon={appData.site.icon}
          background={appData.site.icon_background}
          imageUrl={appData.site.icon_url}
        />
      )
    : null

  return (
    <div
      className="h-full overflow-hidden"
    >
      <Chat
        appData={appData ?? undefined}
        config={appConfig}
        chatList={messageList}
        isResponding={respondingState}
        chatContainerInnerClassName={`mx-auto pt-6 w-full max-w-[768px] ${isMobile && 'px-4'}`}
        chatFooterClassName="pb-4"
        chatFooterInnerClassName={`mx-auto w-full max-w-[768px] ${isMobile ? 'px-2' : 'px-4'}`}
        onSend={doSend}
        inputs={currentConversationId ? currentConversationInputs as any : newConversationInputs}
        inputsForm={inputsForms}
        onRegenerate={doRegenerate}
        onStopResponding={handleStop}
        onHumanInputFormSubmit={handleSubmitHumanInputForm}
        chatNode={(
          <>
            {chatNode}
            {welcome}
          </>
        )}
        allToolIcons={appMeta?.tool_icons || {}}
        onFeedback={handleFeedback}
        suggestedQuestions={suggestedQuestions}
        answerIcon={answerIcon}
        hideProcessDetail
        themeBuilder={themeBuilder}
        switchSibling={doSwitchSibling}
        inputDisabled={inputDisabled}
        sidebarCollapseState={sidebarCollapseState}
        questionIcon={
          initUserVariables?.avatar_url
            ? (
                <Avatar
                  avatar={initUserVariables.avatar_url}
                  name={initUserVariables.name || 'user'}
                  size="xl"
                />
              )
            : undefined
        }
        noChatInput={!currentConversationId}
      />
    </div>
  )
}

export default ChatWrapper
