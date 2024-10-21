const translation = {
  common: {
    welcome: '',
    appUnavailable: 'App is unavailable',
    appUnknownError: 'App is unavailable',
  },
  chat: {
    newChat: 'New chat',
    pinnedTitle: 'Pinned',
    unpinnedTitle: 'Chats',
    newChatDefaultName: 'New conversation',
    resetChat: 'Reset conversation',
    poweredBy: 'Powered by',
    prompt: 'Prompt',
    privatePromptConfigTitle: 'Conversation settings',
    publicPromptConfigTitle: 'Initial Prompt',
    configStatusDes: 'Before start, you can modify conversation settings',
    configDisabled:
      'Previous session settings have been used for this session.',
    startChat: 'Start Chat',
    privacyPolicyLeft:
      'Please read the ',
    privacyPolicyMiddle:
      'privacy policy',
    privacyPolicyRight:
      ' provided by the app developer.',
    deleteConversation: {
      title: '删除对话',
      content: '您确定要删除此对话吗？',
    },
    tryToSolve: '尝试解决',
    temporarySystemIssue: '抱歉，临时系统问题。',
  },
  generation: {
    tabs: {
      create: '运行一次',
      batch: '批量运行',
      saved: '已保存',

    },
    savedNoData: {
      title: '您还没有保存结果！',
      description: '开始生成内容，您可以在这里找到保存的结果。',
      startCreateContent: '开始生成内容',
    },
    title: 'AI 智能书写',
    queryTitle: '查询内容',
    completionResult: '生成结果',
    queryPlaceholder: '请输入文本内容',
    run: '运行',
    copy: '拷贝',
    resultTitle: 'AI 书写',
    noData: 'AI 会在这里给你惊喜。',
    csvUploadTitle: '将您的 CSV 文件拖放到此处，或',
    browse: '浏览',
    csvStructureTitle: 'CSV 文件必须符合以下结构：',
    downloadTemplate: '下载模板',
    field: '',
    batchFailed: {
      info: '{{num}} 次运行失败',
      retry: '重试',
      outputPlaceholder: '无输出内容',
    },
    errorMsg: {
      empty: '上传文件的内容不能为空',
      fileStructNotMatch: '上传文件的内容与结构不匹配',
      emptyLine: '第 {{rowIndex}} 行的内容为空',
      invalidLine: '第 {{rowIndex}} 行: {{varName}}值必填',
      moreThanMaxLengthLine: '第 {{rowIndex}} 行: {{varName}}值超过最大长度 {{maxLength}}',
      atLeastOne: '上传文件的内容不能少于一条',
    },
  },
}

export default translation
