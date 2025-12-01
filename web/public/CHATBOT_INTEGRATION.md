# Dify Chatbot 集成指南

> 本文档提供完整的 Dify Chatbot 集成方案，包括 URL 参数配置和实体标签功能。

## 目录

- [快速开始](#快速开始)
- [URL 参数配置](#url-参数配置)
- [实体标签功能](#实体标签功能)
- [链接点击功能](#链接点击功能)
- [完整集成示例](#完整集成示例)
- [Demo 测试页面](#demo-测试页面)

---

## 快速开始

### 基础 iframe 集成

```html
<iframe 
  id="chatbot-iframe"
  src="/chatbot/YOUR_TOKEN"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

### React 集成

```tsx
import { useRef } from 'react';

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  return (
    <iframe
      ref={iframeRef}
      src="/chatbot/YOUR_TOKEN"
      style={{ width: '100%', height: '600px' }}
    />
  );
}
```

---

## URL 参数配置

Chatbot 支持通过 URL 参数自定义外观和行为。参数分为两类：**基础参数**（直接传递）和**系统/自定义参数**（需要压缩编码）。

### 基础参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `prompt` | string | 自动填充并发送的消息 | `?prompt=你好` |
| `hideTitle` | boolean | 隐藏标题栏 | `?hideTitle=true` |
| `backgroundColor` | string | 自定义背景色（十六进制，需 URL 编码） | `?backgroundColor=%23FFFFFF` |

**示例 URL：**
```
/chatbot/igJgPiPgHAEX6uP4?prompt=你好&hideTitle=true&backgroundColor=%23FFFFFF
```

### 系统参数（压缩编码）

系统参数和自定义参数需要经过 **gzip 压缩 + Base64 编码** 后传递，以减少 URL 长度。

| 参数 | 说明 | 示例值 |
|------|------|--------|
| `sys.conversation_id` | 会话 ID，用于恢复历史会话 | `conv_123456` |
| `sys.user_id` | 用户 ID，用于用户识别 | `user_789` |
| `customParams.*` | 任意自定义参数（动态） | `{ resumeid: '259289', jobid: 'job_456' }` |

### 参数压缩工具函数

```typescript
// 压缩并编码字符串
async function compressAndEncodeBase64(input: string): Promise<string> {
  const uint8Array = new TextEncoder().encode(input);
  const compressedStream = new Response(
    new Blob([uint8Array]).stream()
      .pipeThrough(new CompressionStream('gzip'))
  ).arrayBuffer();
  const compressedUint8Array = new Uint8Array(await compressedStream);
  return btoa(String.fromCharCode(...compressedUint8Array));
}

// 批量压缩参数
async function getCompressedInputs(inputs: Record<string, string>): Promise<Record<string, string>> {
  const compressedInputs: Record<string, string> = {};
  await Promise.all(
    Object.entries(inputs).map(async ([key, value]) => {
      if (value) {
        compressedInputs[key] = await compressAndEncodeBase64(value);
      }
    })
  );
  return compressedInputs;
}

// 构建完整 URL
async function buildChatbotUrl(token: string, options: {
  prompt?: string;
  hideTitle?: boolean;
  backgroundColor?: string;
  conversationId?: string;
  userId?: string;
  customParams?: Record<string, string>;
}): Promise<string> {
  const params = new URLSearchParams();
  
  // 基础参数
  if (options.prompt) params.append('prompt', options.prompt);
  if (options.hideTitle) params.append('hideTitle', 'true');
  if (options.backgroundColor) params.append('backgroundColor', options.backgroundColor);
  
  // 系统和自定义参数（压缩）
  const inputsToCompress: Record<string, string> = {};
  if (options.conversationId) inputsToCompress['sys.conversation_id'] = options.conversationId;
  if (options.userId) inputsToCompress['sys.user_id'] = options.userId;
  if (options.customParams) {
    Object.entries(options.customParams).forEach(([key, value]) => {
      if (value) inputsToCompress[key] = value;
    });
  }
  
  if (Object.keys(inputsToCompress).length > 0) {
    const compressed = await getCompressedInputs(inputsToCompress);
    Object.entries(compressed).forEach(([key, value]) => {
      params.append(key, value);
    });
  }
  
  return `/chatbot/${token}?${params.toString()}`;
}
```

### 使用示例

```typescript
// 构建带参数的 URL
const url = await buildChatbotUrl('YOUR_TOKEN', {
  prompt: '请帮我分析这个用户',
  hideTitle: true,
  backgroundColor: '#F5F5F5',
  conversationId: 'conv_123',
  userId: 'user_789',
  customParams: {
    resumeid: '259289',
    jobid: 'job_456'
  }
});

// 更新 iframe src
document.getElementById('chatbot-iframe').src = url;
```

### URL 长度限制

- **推荐长度**：< 2048 字符（兼容旧版浏览器/代理）
- **最大长度**：< 65536 字符（现代浏览器支持）
- 使用压缩编码可大幅减少 URL 长度

---

## 实体标签功能

实体标签功能允许外部应用通过 **postMessage** 向 Chatbot 输入框注入实体对象（如用户、订单、产品），这些实体会以**标签形式**展示，用户可以删除但不能编辑，发送时会自动转换为实际的值。

### 使用场景

- 业务系统选择用户、订单、产品等实体后，注入到对话中
- 实现类似 @ Mention 的功能
- 结构化数据的可视化输入

### 实体格式

```typescript
type EntityTag = {
  icon?: string;   // 可选，显示的图标（emoji 或图片 URL）
  label?: string;  // 可选，显示的文本
  value: string;   // 必需，发送给大模型的实际值
}
```

**Icon 支持：**
- ✅ Emoji：`'👤'`, `'📦'`, `'🛍️'`
- ✅ 图片 URL：`'https://example.com/avatar.png'`
- ✅ Data URI：`'data:image/png;base64,...'`

**显示与发送格式：**
- **界面显示**：`[👤 张三]` 或 `[🖼️ 张三]`（图片头像）
- **实际发送**：`[张三](user_3391)` （Markdown 链接格式）
- **LLM 识别**：大模型可以同时看到友好的标签名称和实际的实体 ID

### 发送实体标签

#### 1. 基础用法

```javascript
const iframe = document.getElementById('chatbot-iframe');

iframe.contentWindow.postMessage({
  type: 'dify-add-entity-tags',
  payload: {
    tags: [
      { icon: '👤', label: '张三', value: 'user_3391' },
      { icon: '📦', label: '订单 123456', value: 'order_123456' }
    ]
  }
}, '*');
```

#### 2. 发送单个实体

```javascript
function sendUserEntity(userId, userName) {
  const iframe = document.getElementById('chatbot-iframe');
  iframe.contentWindow.postMessage({
    type: 'dify-add-entity-tags',
    payload: {
      tags: [
        { icon: '👤', label: userName, value: userId }
      ]
    }
  }, '*');
}

// 使用
sendUserEntity('user_3391', '张三');
```

#### 3. 使用图片 URL 作为 Icon

```javascript
// 使用用户头像作为 icon
iframe.contentWindow.postMessage({
  type: 'dify-add-entity-tags',
  payload: {
    tags: [
      { 
        icon: 'https://avatar.example.com/user123.png', 
        label: 'Alice', 
        value: 'user_alice' 
      },
      { 
        icon: 'https://avatar.example.com/user456.png', 
        label: 'Bob', 
        value: 'user_bob' 
      }
    ]
  }
}, '*');

// 使用 Data URI
iframe.contentWindow.postMessage({
  type: 'dify-add-entity-tags',
  payload: {
    tags: [
      { 
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...', 
        label: '产品 A', 
        value: 'product_a001' 
      }
    ]
  }
}, '*');
```

#### 4. 批量发送多个实体

```javascript
function sendMultipleEntities(entities) {
  const iframe = document.getElementById('chatbot-iframe');
  const tags = entities.map(entity => ({
    icon: entity.icon,
    label: entity.label,
    value: entity.value
  }));
  
  iframe.contentWindow.postMessage({
    type: 'dify-add-entity-tags',
    payload: { tags }
  }, '*');
}

// 使用
sendMultipleEntities([
  { icon: '👤', label: '张三', value: 'user_3391' },
  { icon: '👤', label: '李四', value: 'user_4521' }
]);
```

#### 4. React 组件示例

```tsx
import { useRef } from 'react';

function MyComponent() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sendEntityToChat = (entity: {
    icon?: string;
    label?: string;
    value: string;
  }) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'dify-add-entity-tags',
        payload: {
          tags: [entity]
        }
      }, '*');
    }
  };

  return (
    <div>
      <button onClick={() => sendEntityToChat({
        icon: '👤',
        label: '张三',
        value: 'user_3391'
      })}>
        发送用户信息
      </button>
      
      <iframe
        ref={iframeRef}
        src="/chatbot/YOUR_TOKEN"
        style={{ width: '100%', height: '600px' }}
      />
    </div>
  );
}
```

### 实体标签特性

- ✅ **只读显示**：标签在输入框中以只读形式展示
- ✅ **可删除**：用户可以点击 ❌ 删除标签
- ✅ **不可编辑**：用户无法修改标签内容
- ✅ **自动转换**：发送消息时，标签会自动替换为 `value` 字段
- ✅ **支持批量**：一次可以发送多个实体标签

### Markdown 链接格式

实体标签在发送给大模型时会自动转换为 **Markdown 链接格式**：

```
[显示名称](实体ID)
```

**优势：**
1. ✨ **双重信息**：大模型同时获得友好名称和精确的实体标识
2. 📖 **可读性强**：对话历史更容易理解
3. 🔗 **结构化**：保留了实体的结构化信息
4. 🎯 **精确引用**：大模型可以通过 ID 准确识别实体

**示例对比：**

| 方式 | 发送内容 | 效果 |
|------|---------|------|
| ❌ 纯 ID | `user_3391 order_123456 请分析风险` | 难以理解 |
| ✅ Markdown | `[张三](user_3391) [订单 123456](order_123456) 请分析风险` | 清晰易懂 |

### 实体标签示例

| 界面显示 | 实际发送格式 | 说明 |
|---------|-------------|------|
| `[👤 张三]` | `[张三](user_3391)` | 带 icon 和 label |
| `[📦 订单 123456]` | `[订单 123456](order_123456)` | 带 icon 和 label |
| `[🛍️ 产品 A]` | `[产品 A](product_a001)` | 带 icon 和 label |
| `[raw_data_12345]` | `[raw_data_12345](raw_data_12345)` | 仅 value，无 icon/label |

**完整对话示例：**
- **界面输入**：`[👤 张三] [📦 订单 123456] 请帮我分析风险`
- **实际发送**：`[张三](user_3391) [订单 123456](order_123456) 请帮我分析风险`
- **效果**：大模型既能看到 "张三"、"订单 123456" 这样的友好名称，也能获取 `user_3391`、`order_123456` 这样的实体 ID

---

## 链接点击功能

### 链接处理规则

| 类型 | 示例 | 行为 |
|------|------|------|
| 内部链接 | `/project/123` | 拦截并发送消息 |
| 外部链接 | `https://google.com` | 拦截并发送消息 |
| Hash 锚点 | `#section-1` | 不拦截 |
| 危险协议 | `javascript:...` | 阻止执行 |

### 外部项目集成

```html
<!DOCTYPE html>
<html>
<head>
  <title>Chatbot 集成示例</title>
  <style>
    body { margin: 0; display: flex; height: 100vh; }
    #chatbot { flex: 1; border: none; }
    #preview { flex: 1; border: none; border-left: 1px solid #ddd; }
  </style>
</head>
<body>
  <!-- Chatbot iframe -->
  <iframe id="chatbot" src="/chatbot/YOUR_TOKEN"></iframe>
  
  <!-- 链接预览 iframe -->
  <iframe id="preview" style="display: none;"></iframe>

  <script>
    // 监听链接点击消息
    window.addEventListener('message', function(event) {
      // 验证消息来源（可选）
      // if (event.origin !== 'https://your-chatbot-domain.com') return;
      
      // 处理链接点击
      if (event.data?.type === 'dify-link-click') {
        const url = event.data.payload.url;
        const preview = document.getElementById('preview');
        
        // 显示并加载链接
        preview.style.display = 'block';
        preview.src = url;
        
        console.log('Link clicked:', url);
      }
    });
  </script>
</body>
</html>
```


---

## 完整集成示例

### HTML + Vanilla JS

```html
<!DOCTYPE html>
<html>
<head>
  <title>Chatbot 集成示例</title>
  <style>
    .container {
      display: flex;
      gap: 20px;
      padding: 20px;
    }
    .sidebar {
      width: 300px;
    }
    .chat-container {
      flex: 1;
      height: 600px;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    button {
      display: block;
      width: 100%;
      margin: 10px 0;
      padding: 10px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #45a049;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <h3>操作面板</h3>
      <button onclick="sendUser()">发送用户实体</button>
      <button onclick="sendOrder()">发送订单实体</button>
      <button onclick="sendMultiple()">发送多个实体</button>
    </div>
    
    <div class="chat-container">
      <iframe id="chatbot-iframe" src="/chatbot/YOUR_TOKEN"></iframe>
    </div>
  </div>

  <script>
    const iframe = document.getElementById('chatbot-iframe');
    
    function sendUser() {
      iframe.contentWindow.postMessage({
        type: 'dify-add-entity-tags',
        payload: {
          tags: [{ icon: '👤', label: '张三', value: 'user_3391' }]
        }
      }, '*');
    }
    
    function sendOrder() {
      iframe.contentWindow.postMessage({
        type: 'dify-add-entity-tags',
        payload: {
          tags: [{ icon: '📦', label: '订单 123456', value: 'order_123456' }]
        }
      }, '*');
    }
    
    function sendMultiple() {
      iframe.contentWindow.postMessage({
        type: 'dify-add-entity-tags',
        payload: {
          tags: [
            { icon: '👤', label: '张三', value: 'user_3391' },
            { icon: '📦', label: '订单 789', value: 'order_789' },
            { icon: '🛍️', label: '产品 A', value: 'product_a001' }
          ]
        }
      }, '*');
    }
  </script>
</body>
</html>
```

### React + TypeScript 完整示例

```tsx
import { useRef, useState } from 'react';

type EntityTag = {
  icon?: string;
  label?: string;
  value: string;
};

type User = {
  id: string;
  name: string;
  avatar?: string;
};

function ChatbotIntegration() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [users] = useState<User[]>([
    { id: 'user_3391', name: '张三', avatar: '👤' },
    { id: 'user_4521', name: '李四', avatar: '👤' },
  ]);

  const sendEntityToChat = (tags: EntityTag[]) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'dify-add-entity-tags',
        payload: { tags }
      }, '*');
    }
  };

  const handleUserClick = (user: User) => {
    sendEntityToChat([{
      icon: user.avatar,
      label: user.name,
      value: user.id
    }]);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      {/* 侧边栏 */}
      <div style={{ width: '300px' }}>
        <h3>用户列表</h3>
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => handleUserClick(user)}
            style={{
              display: 'block',
              width: '100%',
              margin: '10px 0',
              padding: '10px',
              textAlign: 'left'
            }}
          >
            {user.avatar} {user.name}
          </button>
        ))}
      </div>

      {/* Chatbot */}
      <div style={{ flex: 1 }}>
        <iframe
          ref={iframeRef}
          src="/chatbot/YOUR_TOKEN"
          style={{
            width: '100%',
            height: '600px',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}
        />
      </div>
    </div>
  );
}

export default ChatbotIntegration;
```

### Vue 3 示例

```vue
<template>
  <div class="chatbot-integration">
    <div class="sidebar">
      <h3>用户列表</h3>
      <button 
        v-for="user in users" 
        :key="user.id"
        @click="handleUserClick(user)"
      >
        {{ user.avatar }} {{ user.name }}
      </button>
    </div>
    
    <div class="chat-container">
      <iframe 
        ref="iframeRef"
        src="/chatbot/YOUR_TOKEN"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type EntityTag = {
  icon?: string;
  label?: string;
  value: string;
};

type User = {
  id: string;
  name: string;
  avatar: string;
};

const iframeRef = ref<HTMLIFrameElement | null>(null);

const users = ref<User[]>([
  { id: 'user_3391', name: '张三', avatar: '👤' },
  { id: 'user_4521', name: '李四', avatar: '👤' },
]);

const sendEntityToChat = (tags: EntityTag[]) => {
  if (iframeRef.value?.contentWindow) {
    iframeRef.value.contentWindow.postMessage({
      type: 'dify-add-entity-tags',
      payload: { tags }
    }, '*');
  }
};

const handleUserClick = (user: User) => {
  sendEntityToChat([{
    icon: user.avatar,
    label: user.name,
    value: user.id
  }]);
};
</script>

<style scoped>
.chatbot-integration {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.sidebar {
  width: 300px;
}

.chat-container {
  flex: 1;
}

iframe {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

button {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #45a049;
}
</style>
```

---

## Demo 测试页面

我们提供了完整的测试页面，方便您验证和学习集成方式：

### 访问 Demo

1. **URL 参数测试**：`/demo/chatbot-params`
   - 测试 prompt、hideTitle、backgroundColor 参数
   - 测试系统参数和自定义参数
   - 查看 URL 生成和压缩效果

2. **实体标签测试**：`/demo/entity-tags`
   - 测试实体标签的发送和展示
   - 查看多种预设场景
   - 复制集成代码示例

3. **Demo 首页**：`/demo`
   - 导航到所有测试页面

### 本地运行 Demo

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000/demo
```

---

## 常见问题

### Q1：实体标签没有显示？

**A：** 检查以下几点：
1. 确保使用的是增强版 Chatbot（已集成实体标签功能）
2. 检查 postMessage 的 `type` 是否为 `'dify-add-entity-tags'`
3. 确保至少提供了 `value` 字段（icon 和 label 可选）
4. 检查浏览器控制台是否有错误信息

### Q2：URL 参数没有生效？

**A：** 检查以下几点：
1. 系统参数需要压缩编码，不能直接传递明文
2. `backgroundColor` 需要 URL 编码（`#` → `%23`）
3. 检查 URL 是否超过浏览器限制（建议 < 2048 字符）

### Q3：如何调试 postMessage？

**A：** 在 Chatbot iframe 中添加监听：
```javascript
window.addEventListener('message', (event) => {
  console.log('Received message:', event.data);
});
```

### Q4：实体标签发送后能否修改？

**A：** 不能。实体标签一旦发送到 Chatbot，用户只能查看和删除，无法修改内容。如需修改，请删除后重新发送。

### Q5：支持哪些浏览器？

**A：** 支持所有现代浏览器：
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## 技术支持

如有问题或建议，请：
1. 查看 Demo 页面获取示例代码
2. 检查本文档的常见问题部分
3. 联系技术支持团队

---

## 更新日志

### v1.0.0 (2025-01-24)
- ✅ 支持 URL 参数配置（prompt, hideTitle, backgroundColor）
- ✅ 支持系统参数和自定义参数（压缩编码）
- ✅ 实体标签功能（postMessage 注入）
- ✅ 完整的 Demo 测试页面
- ✅ 多框架集成示例（React, Vue, 原生 JS）

