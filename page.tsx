'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2, FileUp } from 'lucide-react';

interface AnalysisResult {
  success: boolean;
  analysis: string;
  fileName: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    const validTypes = ['.pdf', '.docx', '.doc'];
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      setError('请上传 PDF 或 Word 格式的文件');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '分析失败');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析过程中出错');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for the prototype
    return text
      .replace(/##\s*(.+)/g, '<h2 class="text-xl font-bold text-gray-800 mt-6 mb-3">$1</h2>')
      .replace(/###\s*(.+)/g, '<h3 class="text-lg font-semibold text-gray-700 mt-4 mb-2">$1</h3>')
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/-(.+?)(?=\n|$)/g, '<li class="ml-4 text-gray-700">$1</li>')
      .replace(/\n\n/g, '<br/>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            📄 合同智能审查助手
          </h1>
          <p className="text-gray-600 text-lg">
            上传合同文件，AI 自动分析风险、提取关键条款
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-lg text-gray-700 mb-2">
                拖拽文件到此处，或
                <label className="text-blue-600 cursor-pointer hover:underline mx-1">
                  点击选择
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-400">
                支持 PDF、Word 格式，文件大小不超过 10MB
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          {file && !result && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI 分析中，请稍候...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-5 h-5" />
                  <span>开始分析合同</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Analysis Result */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">分析报告</h2>
                <p className="text-sm text-gray-500">{result.fileName}</p>
              </div>
            </div>

            <div 
              className="prose prose-blue max-w-none analysis-result"
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdown(result.analysis) 
              }}
            />

            <div className="mt-8 pt-6 border-t flex justify-center">
              <button
                onClick={clearFile}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                分析下一份合同
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-10 text-sm text-gray-500">
          <p>⚠️ 本工具仅供参考，重要合同建议咨询专业律师</p>
        </div>
      </div>
    </main>
  );
}