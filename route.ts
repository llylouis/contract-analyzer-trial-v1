import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { readFile } from 'fs/promises';

// Dynamic import for pdf-parse (ESM compatibility)
const parsePDF = async (buffer: Buffer) => {
  const pdfModule = await import('pdf-parse');
  // @ts-ignore - ESM module compatibility
  const pdfParse = pdfModule.default || pdfModule.PDFParse;
  // @ts-ignore
  return pdfParse(buffer);
};

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|jpg|jpeg|png)$/i)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload PDF, Word, or image files.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = '';

    // Extract text based on file type
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const data = await parsePDF(buffer);
      text = data.text;
    } else if (file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      // For images, we'd need OCR - for now return a placeholder
      return NextResponse.json({ 
        error: 'Image parsing requires OCR integration. Please upload PDF or Word files for now.' 
      }, { status: 400 });
    }

    if (!text || text.length < 50) {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
    }

    // Call DeepSeek API for analysis
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const prompt = `你是一个专业的合同审查律师。请仔细阅读以下合同内容，并提供结构化的分析报告。

请按以下格式分析：

## 📋 合同概要
- 合同类型：
- 甲方（委托方）：
- 乙方（服务方）：
- 合同金额：
- 合同期限：

## 🔍 关键条款
1. **服务内容**：[简要描述]
2. **付款方式**：[描述]
3. **违约责任**：[描述]
4. **争议解决**：[描述]
5. **其他重要条款**：[列出]

## ⚠️ 风险评估
请识别以下风险并给出等级（高/中/低）：

| 风险项 | 等级 | 说明 |
|--------|------|------|
| 权利义务不明确 | - | - |
| 付款条款不合理 | - | - |
| 违约责任过重 | - | - |
| 违约金过高 | - | - |
| 终止条款不公平 | - | - |
| 保密条款不完善 | - | - |
| 其他风险 | - | - |

## 💡 建议
请提供3-5条具体的改进建议。

---
以下是合同内容：
${text.slice(0, 8000)}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个专业的合同审查律师，擅长分析商业合同并提供风险评估和改进建议。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API error:', error);
      return NextResponse.json({ error: 'AI分析失败，请稍后重试' }, { status: 500 });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || '分析失败';

    return NextResponse.json({ 
      success: true, 
      analysis,
      fileName: file.name 
    });

  } catch (error) {
    console.error('Error processing contract:', error);
    return NextResponse.json({ error: '处理文件时出错' }, { status: 500 });
  }
}