# 关系切片（Relation Slice）

关系切片是一个面向微信聊天记录的趣味关系分析 Web 应用。用户上传聊天记录后，系统会解析消息内容，并通过多 Agent 分析语言风格、情绪波动、互动模式和关系类型，最终生成可视化关系报告。

## 核心功能

- 上传微信聊天数据库文件或已导出的 JSON/CSV/TXT 文件
- 标准化解析聊天消息
- 使用 LangGraph 编排多 Agent 分析流程
- 生成亲密值、依赖指数、默契程度、性格光谱、情绪共振等趣味指标
- 使用苹果极简液态玻璃风格展示分析结果

## 导出文件兜底

如果本机没有安装或无法调用 WeChatMsg，用户仍可直接上传已经导出的聊天文件。当前后端上传接口支持：

- `.json`：消息列表，或包含 `chat_messages`、`messages`、`data`、`records` 字段的对象
- `.csv`：包含发送者、内容、时间等列的表格
- `.txt`：常见格式如 `2026-08-25 12:00:00 Alice: hello`

数据库文件（`.db`、`.sqlite`、`.sqlite3`）会优先走 `WECHATMSG_EXPORT_COMMAND` 配置的 WeChatMsg CLI；如果 CLI 不可用，接口会提示改用已导出的 JSON/CSV/TXT 文件。

## 技术栈

- 前端：React、TypeScript、Vite、Tailwind CSS、Framer Motion、Recharts
- 后端：Python 3.11+、FastAPI、LangChain、LangGraph、langchain-deepseek
- 数据解析：WeChatMsg、JSON、CSV
- 模型：DeepSeek `deepseek-chat`
- 部署：Docker Compose、Nginx、Uvicorn

## 目录结构

```text
relation-slice/
├── backend/
├── frontend/
├── .gitignore
└── README.md
```
