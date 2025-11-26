#!/bin/bash
set -e

GHCR_REGISTRY="ghcr.io"
MESOOR_REGISTRY="cr.mesoor.com"
GITHUB_REPO_OWNER="$(git config --get remote.origin.url | sed -n 's/.*github.com[:/]\([^/]*\)\/.*/\1/p')"
GHCR_IMAGE_NAME="${GITHUB_REPO_OWNER}/dify-web"
MESOOR_IMAGE_NAME="production/dify-web"

VERSION_TAG="$1"

if [ -z "$VERSION_TAG" ]; then
    echo "用法: $0 <version-tag>"
    echo ""
    echo "示例: $0 1.9.1-abc1234"
    echo ""
    echo "提示: 查看最新的 tag，请运行："
    echo "  git log -1 --oneline mesoor"
    exit 1
fi

GHCR_IMAGE="${GHCR_REGISTRY}/${GHCR_IMAGE_NAME}:${VERSION_TAG}"
MESOOR_IMAGE="${MESOOR_REGISTRY}/${MESOOR_IMAGE_NAME}:${VERSION_TAG}"

echo "=========================================="
echo "镜像同步工具"
echo "=========================================="
echo "源镜像: ${GHCR_IMAGE}"
echo "目标镜像: ${MESOOR_IMAGE}"
echo "=========================================="
echo ""

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "错误: 未找到命令 '$1'，请先安装"
        exit 1
    fi
}

check_command docker

echo "步骤 1/4: 检查 Docker 登录状态..."
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker 未运行，请先启动 Docker"
    exit 1
fi

echo "步骤 2/4: 从 GHCR 拉取镜像..."
MAX_PULL_RETRIES=3
RETRY_DELAY=10

for i in $(seq 1 ${MAX_PULL_RETRIES}); do
    echo "  尝试 ${i}/${MAX_PULL_RETRIES}..."
    if docker pull "${GHCR_IMAGE}"; then
        echo "  ✓ 拉取成功"
        break
    else
        if [ ${i} -lt ${MAX_PULL_RETRIES} ]; then
            echo "  ✗ 拉取失败，${RETRY_DELAY} 秒后重试..."
            sleep ${RETRY_DELAY}
        else
            echo "  ✗ 拉取失败，已达到最大重试次数"
            echo ""
            echo "提示: 如果您还未登录 GHCR，请先运行："
            echo "  echo \$GITHUB_TOKEN | docker login ghcr.io -u <your-github-username> --password-stdin"
            exit 1
        fi
    fi
done

echo ""
echo "步骤 3/4: 标记镜像..."
docker tag "${GHCR_IMAGE}" "${MESOOR_IMAGE}"
echo "  ✓ 标记完成"

echo ""
echo "步骤 4/4: 推送到 Mesoor 镜像仓库..."
if ! docker info | grep -q "Registry: ${MESOOR_REGISTRY}" 2>/dev/null; then
    echo "提示: 请确保已登录到 ${MESOOR_REGISTRY}"
    echo "如未登录，请运行: docker login ${MESOOR_REGISTRY}"
    echo ""
    read -p "按 Enter 继续推送，或 Ctrl+C 取消..."
fi

MAX_PUSH_RETRIES=5
RETRY_DELAY=30

for i in $(seq 1 ${MAX_PUSH_RETRIES}); do
    echo "  尝试 ${i}/${MAX_PUSH_RETRIES}..."
    if docker push "${MESOOR_IMAGE}"; then
        echo "  ✓ 推送成功"
        break
    else
        if [ ${i} -lt ${MAX_PUSH_RETRIES} ]; then
            echo "  ✗ 推送失败，${RETRY_DELAY} 秒后重试..."
            sleep ${RETRY_DELAY}
        else
            echo "  ✗ 推送失败，已达到最大重试次数"
            echo ""
            echo "提示: 请检查网络连接和登录状态"
            exit 1
        fi
    fi
done

echo ""
echo "=========================================="
echo "✓ 镜像同步完成！"
echo "=========================================="
echo "镜像: ${MESOOR_IMAGE}"
echo ""
echo "清理本地镜像（可选）："
echo "  docker rmi ${GHCR_IMAGE}"
echo "  docker rmi ${MESOOR_IMAGE}"
echo "=========================================="

