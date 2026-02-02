# Web API Proxy for /v1/chat-messages

## 概述

这是一个 Web 端的 `/v1/chat-messages` 平替接口，用于解决 API 端创建的会话无法在 Web 端访问的问题。

## 问题背景

- **API 端**创建的 EndUser：`type="service_api"`
- **Web 端**创建的 EndUser：`type="browser"`
- 即使 `session_id` 相同，它们是两条不同的数据库记录
- 导致 Web 端无法访问 API 创建的会话

## 解决方案

在源头统一：通过 Web 代理接口，将 API 请求转换为 Web 请求，创建 `type="browser"` 的会话。

```
其他项目后端 → /v1/chat-messages (Web 代理)
                     ↓
         1. 验证 API token (Bearer app-xxx)
         2. 根据 user 参数获取 Web token
         3. 使用 Web token 调用后端
                     ↓
              创建 type=browser 会话
                     ↓
              Web 端可直接访问 ✅
```

## API 接口

### 请求

```bash
POST https://your-domain.com/api/v1/chat-messages
Content-Type: application/json
Authorization: Bearer app-xxx

{
  "web_app_code": "igJgPiPgHAEX6uP4",  # 必需：Web 应用的 app code
  "user": "272455",                    # 必需：用户标识
  "query": "简历优化",                 # 必需：用户消息
  "inputs": {                          # 可选：输入变量
    "resumeid": "272455",
    "jobid": "",
    "projectid": "",
    "source": "machine"
  },
  "response_mode": "streaming",        # 可选：streaming 或 blocking，默认 streaming
  "conversation_id": "",               # 可选：会话 ID（继续对话时提供）
  "files": []                          # 可选：文件列表
}
```

**重要参数说明**：

- `web_app_code`: Web 应用的标识码，可以在 Dify 控制台的「访问 API」页面获取，格式类似 `igJgPiPgHAEX6uP4`
- `Authorization`: Service API 的 token，格式为 `Bearer app-xxx`

### 响应

#### Streaming 模式 (response_mode: "streaming")

返回 SSE (Server-Sent Events) 流：

```
Content-Type: text/event-stream

data: {"event":"message","task_id":"xxx","id":"xxx","answer":"..."}

data: {"event":"message_end","task_id":"xxx","id":"xxx","metadata":{"...}}
```

#### Blocking 模式 (response_mode: "blocking")

返回 JSON：

```json
{
  "message_id": "xxx",
  "conversation_id": "xxx",
  "mode": "chat",
  "answer": "...",
  "metadata": {},
  "created_at": 1234567890
}
```

## 测试步骤

### 1. 准备环境

确保项目已启动：

```bash
# 启动 Web 端
cd web
pnpm dev

# 后端应该已经在运行
```

### 2. 测试 API 调用

```bash
# 替换为实际的域名、API token 和 web_app_code
curl -X POST 'https://agent.nadileaf.com/api/v1/chat-messages' \
  --header 'Authorization: Bearer app-GnbV0rkZEmVbEl0IOeu3jXsv' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "web_app_code": "igJgPiPgHAEX6uP4",
    "inputs": {
      "resumeid": "272455",
      "jobid": "",
      "projectid": "",
      "source": "machine"
    },
    "query": "简历优化",
    "response_mode": "streaming",
    "user": "272455"
  }'
```

### 3. 验证 Web 端访问

从响应中获取 `conversation_id`，然后访问：

```
https://agent.nadileaf.com/chat/{token}?sys.user_id=272455&sys.conversation_id={conversation_id}
```

**预期结果**：
- ✅ 能够成功加载会话历史
- ✅ 不再出现 404 错误
- ✅ 可以继续对话
- ✅ 会话列表中可见

## 技术细节

### 后端 URL 配置

代码会读取环境变量来确定后端 URL：

```typescript
function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_PUBLIC_API_PREFIX || 'http://localhost:5001/api'
}
```

**配置方式**：
- 在 `.env.local` 中设置 `NEXT_PUBLIC_PUBLIC_API_PREFIX`
- 例如：`NEXT_PUBLIC_PUBLIC_API_PREFIX=https://agent.nadileaf.com/api`
- 如果不配置，默认使用 `http://localhost:5001/api`

### 工作流程

1. **接收请求**：接收 API 格式的请求（Bearer token + web_app_code + user 参数）
2. **环境检测**：根据运行环境选择后端 URL
3. **获取 Web Token**：
   - 调用 `/api/passport?user_id={user}`
   - 使用 `X-App-Code: {web_app_code}` header
   - 返回 Web 端的 JWT token
4. **转发请求**：
   - 使用 Web token 调用 `/api/chat-messages`
   - 这样创建的会话是 `type=browser`
5. **返回响应**：
   - Streaming 模式：直接流式返回
   - Blocking 模式：返回 JSON

### 优势

- ✅ **源头统一**：所有会话都是 `type=browser`
- ✅ **零业务改动**：其他项目不需要修改代码
- ✅ **完全兼容**：所有 Web 功能（列表、删除、重命名）自动兼容
- ✅ **只需部署前端**：不需要部署后端

### 与原 API 的兼容性

| 特性 | 原 API (/v1/chat-messages) | Web 代理 (/api/v1/chat-messages) |
|------|---------------------------|----------------------------------|
| 请求格式 | ✅ 相同 | ✅ 相同 |
| Bearer Token | ✅ app-xxx | ✅ app-xxx |
| user 参数 | ✅ 支持 | ✅ 支持 |
| Streaming | ✅ 支持 | ✅ 支持 |
| Blocking | ✅ 支持 | ✅ 支持 |
| 响应格式 | ✅ 相同 | ✅ 相同 |
| Web 端访问 | ❌ 不支持 | ✅ 支持 |

## 注意事项

1. **web_app_code 参数**：必须提供，这是 Web 应用的标识码（不同于 Service API token）
2. **API Token 格式**：必须是 `app-` 开头的格式
3. **user 参数**：必须提供，用于创建/获取 Web EndUser
4. **环境变量**：在 `.env.local` 中配置 `NEXT_PUBLIC_PUBLIC_API_PREFIX` 指向后端 API 地址
5. **后端服务**：确保后端 API 服务可访问（直接运行或通过代理）

### 如何获取 web_app_code

1. 登录 Dify 控制台
2. 进入应用详情页
3. 点击「访问 API」
4. 在 URL 中可以找到类似 `https://your-domain.com/chat/igJgPiPgHAEX6uP4` 的地址
5. 其中 `igJgPiPgHAEX6uP4` 就是 `web_app_code`

## 故障排查

### 401 Unauthorized
- 检查 API token 是否正确
- 检查 token 格式是否为 `app-xxx`

### 404 Not Found (passport)
- 检查 `NEXT_PUBLIC_PUBLIC_API_PREFIX` 环境变量
- 确认后端服务正常运行

### 500 Internal Server Error
- 查看服务器日志：`console.error` 输出
- 检查后端 `/api/passport` 和 `/api/chat-messages` 接口

## 迁移建议

对于其他项目，需要修改两处：

1. 修改调用的 URL（注意路径变化）
2. 添加 `web_app_code` 参数

```bash
# 原来
curl https://agent.nadileaf.com/v1/chat-messages \
  --header 'Authorization: Bearer app-xxx' \
  --data '{"user":"123","query":"test"}'

# 改为
curl https://agent.nadileaf.com/api/v1/chat-messages \
  --header 'Authorization: Bearer app-xxx' \
  --data '{"web_app_code":"igJgPiPgHAEX6uP4","user":"123","query":"test"}'
```

**变更点**：
1. URL: `/v1/chat-messages` → `/api/v1/chat-messages`
2. 请求体: 添加 `"web_app_code": "your_code"`
