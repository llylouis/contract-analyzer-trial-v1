# 📄 合同智能审查助手

基于 Next.js + DeepSeek API 的合同自动分析工具。

## 功能特点

- ✅ 支持 PDF、Word 格式合同上传
- ✅ AI 自动提取合同关键信息
- ✅ 智能风险评估（高/中/低三级）
- ✅ 可视化分析报告
- ✅ 一键部署至 Vercel

## 快速开始

### 1. 克隆项目

```bash
git clone <repo-url>
cd contract-analyzer
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API Key

1. 前往 [DeepSeek 平台](https://platform.deepseek.com/) 注册并获取 API Key
2. 复制环境变量模板：
   ```bash
   cp .env.local.example .env.local
   ```
3. 编辑 `.env.local`，填入你的 API Key：
   ```
   DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
   ```

### 4. 本地运行

```bash
npm run dev
```

访问 http://localhost:3000 即可使用。

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在 Environment Variables 中添加 `DEEPSEEK_API_KEY`
4. 一键部署即可

## 项目结构

```
contract-analyzer/
├── app/
│   ├── api/
│   │   └── analyze/        # AI 分析 API
│   │       └── route.ts
│   ├── page.tsx            # 主页面
│   ├── layout.tsx          # 布局
│   └── globals.css         # 全局样式
├── types/
│   └── pdf-parse.d.ts      # PDF 解析类型
├── .env.local.example      # 环境变量模板
├── next.config.ts          # Next.js 配置
└── README.md
```

## 注意事项

⚠️ **免责声明**：本工具仅供参考，重要合同建议咨询专业律师。

## 技术栈

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 样式
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) - PDF 解析
- [mammoth](https://www.npmjs.com/package/mammoth) - Word 解析
- [DeepSeek API](https://platform.deepseek.com/) - AI 分析