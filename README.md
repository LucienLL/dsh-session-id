# dsh-session-id

在 DeepSeek Harness Web UI 的会话头部显示当前对话 ID，点击一键复制到剪贴板。

## 功能

- 会话头部右侧显示当前会话 ID（超长时截断显示，悬停可见完整 ID）
- 点击复制完整 ID，短暂显示「已复制」（需安全上下文 localhost/https；剪贴板不可用时无反馈）

## 安装

```sh
dsh plugin --profile web add dsh-session-id
# 或本地开发（在仓库目录内执行）：
dsh plugin --profile web add .
```

安装后重启 `dsh web` 生效。

## 实现

纯客户端插件：注入官方 slot `conversation.session.header.utilities`（`scope: session`），
框架自动注入 `sessionId`，无需任何宿主侧逻辑。
