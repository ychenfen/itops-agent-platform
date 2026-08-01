# ITOps Agent Platform

企业 IT 运维多 Agent 自动化平台。把服务器、网络、容器、告警、工作流、多 Agent、知识库和审计能力集中到一个 Web 控制台，默认以单机形态交付，不强制引入外置数据库或缓存。

本仓库是 2026 中国软件杯大赛 · 信息技术应用创新赛的参赛作品与全套交付材料，版本 v3.0.6。

## 技术栈

| 层次 | 技术 |
|---|---|
| 交互层 | React 18、Ant Design、Tailwind、React Query |
| 接入层 | Vite、Express、Socket.IO、Swagger |
| 业务层 | 18 个限界上下文、服务注册表、依赖注入容器 |
| 数据层 | better-sqlite3、Repository 模式、版本化迁移（104 张表） |
| 集成层 | SSH2、Dockerode、SNMP、SMTP、Webhook、MCP/LLM |

后端 Express + TypeScript 监听 3001，前端监听 3002，默认数据库为随应用交付的 SQLite。Docker、Kubernetes、SNMP、邮件和大模型服务全部通过集成层适配器接入，任一不可用时对应模块标记 `degraded`，不阻断平台启动和核心功能。

## 快速开始

从源码启动：

```bash
cd 07_软件源代码文件/itops-agent-platform-source-v3.0.6
npm ci && (cd backend && npm ci) && (cd frontend && npm ci)
```

配置后端环境变量（至少设置 `JWT_SECRET` 和 `ADMIN_INITIAL_PASSWORD`），然后：

```bash
cd backend && npm run build && npm start
```

前端另开一个终端：

```bash
cd frontend && npm run build && npm run preview -- --host 0.0.0.0 --port 3002
```

健康检查：

```bash
curl http://127.0.0.1:3001/health
```

`/health` 返回综合状态，`/health/live` 是进程存活，`/health/ready` 是就绪探针。完整部署步骤（含 systemd 自启与银河麒麟环境）见 `06_软件安装包及部署文档/软件安装部署手册.docx`。

## 当前状态

自动化测试 966/966 通过，前后端生产构建均可通过。性能基线在本地回环网络下测得：`/health/live` 吞吐 1568 req/s、P95 24.27 ms，`/health` 吞吐 1402 req/s、P95 10.33 ms，1000 次请求零失败。这组数据取自轻量只读场景，不含 TLS、反向代理和业务写入，不构成生产容量承诺。

信创适配方面，v3.0.5 曾在银河麒麟 V11 loongarch64 实机完成部署验证：better-sqlite3 原生模块本地编译通过，前后端健康检查返回 200，两个 systemd 服务 enabled 且 Restart=always，强制终止进程后自动恢复。已知边界是麒麟环境的 Node 缺少 windows-1252 ICU 数据，PDFKit 改为按需加载，核心平台可正常启动但 PDF 报表导出需单独复测。v3.0.6 的改动未在麒麟实机上复测过。

## 交付材料

| 目录 | 内容 |
|---|---|
| `00_参加挑战赛理由及作品亮点` | 挑战赛说明文档 |
| `01_软件功能需求分析文档` | 功能、接口、数据、安全与质量需求 |
| `02_软件功能设计文档` | 总体架构、模块、接口、数据与安全设计 |
| `03_软件产品说明书` | 用户操作、功能说明与日常维护指南 |
| `04_软件功能测试报告` | 自动化测试、运行验证与兼容性检查 |
| `05_软件性能核心指标测试报告` | HTTP 基线与恢复能力验证 |
| `06_软件安装包及部署文档` | 安装包与部署手册 |
| `07_软件源代码文件` | 完整源码与源码包 |
| `08_软件功能演示PPT` | 功能演示幻灯片 |
| `9-功能演示视频` | 提交版演示视频 |

## 未入库的内容

- `node_modules/`：依赖由 `package-lock.json` 锁定，用 `npm ci` 安装
- `backend/data/app.db`：运行时数据库，含管理员口令哈希与审计记录
- `9-功能演示视频/新版录制素材/` 及原始录屏：非交付物，且其中两个 `.mov` 超过 GitHub 100 MB 单文件限制

## 许可证

MPL-2.0，见 `07_软件源代码文件` 内的 `LICENSE` 与 `NOTICE.txt`。
