# EmbeddedChatbot 组件

> **外部项目集成请查看：[CHATBOT_INTEGRATION.md](/web/CHATBOT_INTEGRATION.md)**  
> 本文档仅供内部开发参考。

## 组件概述

`EmbeddedChatbot` 是 Dify 的嵌入式聊天机器人组件，支持 URL 参数配置和实体标签功能。

## 内部使用

### 基础组件（原版）

```tsx
import EmbeddedChatbot from '@/app/components/base/chat/embedded-chatbot'

<EmbeddedChatbot />
```

### 增强组件（支持 URL 参数）

```tsx
import EmbeddedChatbotWithQueryParams from '@/app/components/base/chat/embedded-chatbot/with-query-params'

<EmbeddedChatbotWithQueryParams />
```

## 文件结构

```
embedded-chatbot/
├── index.tsx                    # 基础 Chatbot 组件
├── with-query-params.tsx        # URL 参数增强包装器（HOC）
├── context.tsx                  # Context 管理
├── hooks.tsx                    # 自定义 Hooks
├── chat-wrapper.tsx             # 聊天包装组件
├── header/                      # 头部组件
├── theme/                       # 主题相关
└── README.md                    # 本文档
```

## 设计原则

为了最小化与开源版本的合并冲突，所有新功能均采用**非侵入式设计**：

1. **URL 参数功能**：
   - 核心逻辑封装在 `with-query-params.tsx` 中
   - 使用 HOC 模式包装原始组件
   - 原始组件仅接收新的可选 props，无核心逻辑修改

2. **实体标签功能**：
   - 所有逻辑封装在独立的 `entity-tags/` 目录
   - 使用 `ChatInputWithTags` 包装原始 `ChatInputArea`
   - postMessage 监听在独立 hook 中实现

3. **样式修改**：
   - `hideTitle` 通过条件渲染实现
   - `backgroundColor` 通过 props 传递，在组件内部应用

## 关键实现

### URL 参数处理

**`with-query-params.tsx`**：
- 读取 URL 参数（`useSearchParams`）
- 解压缩系统/自定义参数
- 将参数作为 props 传递给原始组件

### 实体标签集成

**`chat-wrapper.tsx`**：
- 将 `ChatInputArea` 替换为 `ChatInputWithTags`
- 标签逻辑完全在 `entity-tags/` 模块中处理

**`chat/index.tsx`**：
- 同样将输入组件替换为增强版本

## 工具函数

参数压缩/解压工具位于：
```
@/app/utils/chatbot-url-params.ts
```

包含：
- `compressAndEncodeBase64()` - 压缩编码
- `decodeAndDecompressBase64()` - 解压解码
- `buildChatbotUrl()` - 构建完整 URL

## 测试页面

- **URL 参数测试**：`/demo/chatbot-params`
- **实体标签测试**：`/demo/entity-tags`
- **Demo 首页**：`/demo`

## 外部集成

**请查看完整的集成文档：[CHATBOT_INTEGRATION.md](/web/CHATBOT_INTEGRATION.md)**

包含：
- 完整的 URL 参数说明
- 实体标签使用指南
- 多框架集成示例（React, Vue, 原生 JS）
- 常见问题解答
