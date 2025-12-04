#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

GHCR_REGISTRY="ghcr.io"
MESOOR_REGISTRY="cr.mesoor.com"
GITHUB_REPO_OWNER="$(git config --get remote.origin.url | sed -n 's/.*github.com[:/]\([^/]*\)\/.*/\1/p')"
GHCR_IMAGE_NAME="${GITHUB_REPO_OWNER}/dify-web"
MESOOR_IMAGE_NAME="production/dify-web"

VERSION_TAG="$1"

if [ -z "$VERSION_TAG" ]; then
    echo -e "${RED}用法: $0 <version-tag>${NC}"
    echo -e "${YELLOW}示例:${NC} $0 1.9.1-abc1234"
    exit 1
fi

GHCR_IMAGE="${GHCR_REGISTRY}/${GHCR_IMAGE_NAME}:${VERSION_TAG}"
MESOOR_IMAGE="${MESOOR_REGISTRY}/${MESOOR_IMAGE_NAME}:${VERSION_TAG}"

echo ""
echo -e "${BOLD}${BLUE}镜像同步: ${NC}${CYAN}${VERSION_TAG}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ 未找到 Docker，请先安装${NC}"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker 未运行${NC}"
    exit 1
fi

echo -e "${CYAN}[1/3]${NC} 从 GHCR 拉取镜像..."
MAX_PULL_RETRIES=3
RETRY_DELAY=10

for i in $(seq 1 ${MAX_PULL_RETRIES}); do
    docker pull "${GHCR_IMAGE}" 2>&1 | grep -E "(Pulling|Digest|Status|Downloaded)" | sed 's/^/      /'
    PULL_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ ${PULL_EXIT_CODE} -eq 0 ]; then
        echo -e "${GREEN}      ✓ 拉取完成${NC}"
        break
    else
        if [ ${i} -lt ${MAX_PULL_RETRIES} ]; then
            echo -e "${YELLOW}      ⚠ 重试中 (${i}/${MAX_PULL_RETRIES})...${NC}"
            sleep ${RETRY_DELAY}
        else
            echo -e "${RED}      ✗ 拉取失败${NC}"
            exit 1
        fi
    fi
done

echo ""
echo -e "${CYAN}[2/3]${NC} 推送到 Mesoor..."
docker tag "${GHCR_IMAGE}" "${MESOOR_IMAGE}"

MAX_PUSH_RETRIES=5
RETRY_DELAY=2

for i in $(seq 1 ${MAX_PUSH_RETRIES}); do
    docker push "${MESOOR_IMAGE}" 2>&1 | grep -E "(Pushing|Pushed|Digest|digest)" | sed 's/^/      /'
    PUSH_EXIT_CODE=${PIPESTATUS[0]}
    
    if [ ${PUSH_EXIT_CODE} -eq 0 ]; then
        echo -e "${GREEN}      ✓ 推送完成${NC}"
        break
    else
        if [ ${i} -lt ${MAX_PUSH_RETRIES} ]; then
            echo -e "${YELLOW}      ⚠ 重试中 (${i}/${MAX_PUSH_RETRIES})...${NC}"
            sleep ${RETRY_DELAY}
        else
            echo -e "${RED}      ✗ 推送失败${NC}"
            exit 1
        fi
    fi
done

echo ""
echo -e "${CYAN}[3/3]${NC} 清理本地镜像..."
docker rmi "${GHCR_IMAGE}" > /dev/null 2>&1 || true
docker rmi "${MESOOR_IMAGE}" > /dev/null 2>&1 || true
echo -e "${GREEN}      ✓ 清理完成${NC}"

echo ""
echo -e "${GREEN}${BOLD}✓ 同步完成${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "镜像: ${CYAN}${MESOOR_IMAGE}${NC}"
echo ""

