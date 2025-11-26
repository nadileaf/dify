# 快速开始

## 🚀 一次性设置（首次使用）

### 1. 配置 GHCR 访问权限

如果您的仓库是私有的，需要确保 GitHub Actions 有权限推送到 GHCR：

1. 进入仓库设置：`Settings` → `Actions` → `General`
2. 找到 `Workflow permissions`
3. 选择 `Read and write permissions`
4. 保存

### 2. 本地登录镜像仓库

在您的电脑或服务器上（国内网络环境）：

```bash
# 登录 GHCR（如果是私有镜像）
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# 登录 Mesoor 镜像仓库
docker login cr.mesoor.com
```

**获取 GitHub Token**：访问 https://github.com/settings/tokens → Generate new token → 勾选 `read:packages`

---

## 📦 日常使用流程

### 步骤 1：推送代码

```bash
git add .
git commit -m "your changes"
git push origin mesoor
```

### 步骤 2：等待 GitHub Actions 完成

访问 GitHub Actions 查看构建进度，通常 5-10 分钟完成。

### 步骤 3：复制同步命令

从 Actions 日志中找到类似这样的输出：

```
==========================================
镜像已推送到 GHCR，请使用以下命令同步到腾讯云：

  ./scripts/sync-image-to-mesoor.sh 1.9.1-abc1234
==========================================
```

### 步骤 4：本地执行同步

在项目根目录运行：

```bash
./scripts/sync-image-to-mesoor.sh 1.9.1-abc1234
```

完成！镜像已推送到 `cr.mesoor.com/production/dify-web:1.9.1-abc1234`

---

## ⚡ 时间对比

| 操作 | 旧方案 | 新方案 |
|------|-------|-------|
| GitHub Actions | 30-40 分钟 | 5-10 分钟 |
| 本地同步 | - | 3-5 分钟 |
| **总计** | **30-40 分钟** | **8-15 分钟** |

**节省时间：50-60%** ⚡

---

## 🔧 故障排查

### 问题 1：拉取 GHCR 镜像失败

```bash
# 检查是否已登录
docker login ghcr.io

# 或使用 GitHub token
echo $GITHUB_TOKEN | docker login ghcr.io -u your-username --password-stdin
```

### 问题 2：推送到 Mesoor 失败

```bash
# 检查是否已登录
docker login cr.mesoor.com

# 检查网络连接
ping cr.mesoor.com
```

### 问题 3：找不到同步命令

查看完整的 Actions 日志，在 "Build and Push to GHCR" 步骤的最后会显示同步命令。

---

## 💡 高级用法

### 在服务器上自动同步

```bash
# 1. 在腾讯云服务器上克隆仓库
git clone <your-repo> && cd dify

# 2. 配置 Docker 登录（使用 credential helper）
docker login ghcr.io
docker login cr.mesoor.com

# 3. 运行同步脚本
./scripts/sync-image-to-mesoor.sh 1.9.1-abc1234
```

### 查看镜像信息

```bash
# 查看本地镜像
docker images | grep dify-web

# 查看镜像大小
docker image inspect <image-id> --format='{{.Size}}' | numfmt --to=iec-i --suffix=B
```

---

## 📚 更多信息

详细文档请参考：[SYNC_IMAGE_README.md](./SYNC_IMAGE_README.md)

