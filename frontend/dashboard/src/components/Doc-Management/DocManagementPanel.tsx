import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentUpload } from './DocumentUpload';
import { DocumentProcessor } from './DocumentProcessor';
import { ExtractedEntities } from './ExtractedEntities';
import { ProcessingHistory } from './ProcessingHistory';

interface ProcessedDocument {
  id: string;
  filename: string;
  extractedText: string;
  detectedLanguage: string;
  entities: any;
  processedAt: string;
  aiProvider: string;
}

export default function DocManagementPanel() {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentDocument, setCurrentDocument] = useState<ProcessedDocument | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingHistory, setProcessingHistory] = useState<ProcessedDocument[]>([]);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();

    // Load processing history from localStorage
    const savedHistory = localStorage.getItem('documentProcessingHistory');
    if (savedHistory) {
      try {
        setProcessingHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load processing history:', e);
      }
    }
  }, []);

  // Save processing history to localStorage
  useEffect(() => {
    if (processingHistory.length > 0) {
      localStorage.setItem('documentProcessingHistory', JSON.stringify(processingHistory));
    }
  }, [processingHistory]);

  const checkApiHealth = async () => {
    try {
      setApiStatus('checking');
      const response = await fetch('http://localhost:5001/health');

      if (response.ok) {
        setApiStatus('connected');
        setError(null);
      } else {
        throw new Error(`API returned status: ${response.status}`);
      }
    } catch (err) {
      setApiStatus('error');
      setError(err instanceof Error ? err.message : t('api_connection_failed'));
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentDocument(null);
    setError(null);
    setActiveTab('upload');
  };

  const handleProcessingComplete = (result: any) => {
    const processedDoc: ProcessedDocument = {
      id: result.id || `doc-${Date.now()}`,
      filename: result.filename,
      extractedText: result.extractedText,
      detectedLanguage: result.detectedLanguage,
      entities: result.entities,
      processedAt: result.processedAt || new Date().toISOString(),
      aiProvider: result.aiProvider || t('ocr_engine')
    };

    setCurrentDocument(processedDoc);
    setProcessingHistory(prev => {
      const newHistory = [processedDoc, ...prev.filter(doc => doc.id !== processedDoc.id)].slice(0, 20);
      return newHistory;
    });
    setProcessing(false);
  };

  const handleProcessingError = (errorMessage: string) => {
    setError(errorMessage);
    setProcessing(false);
  };

  const clearCurrentDocument = () => {
    setCurrentDocument(null);
    setSelectedFile(null);
    setError(null);
  };

  const loadDocumentFromHistory = (doc: ProcessedDocument) => {
    setCurrentDocument(doc);
    setSelectedFile(null);
    setError(null);
    setActiveTab('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-forest-600 to-forest-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("document_management")}</h1>
                <p className="text-gray-600 text-lg">{t("ocr_processing_desc")}</p>
              </div>
            </div>

            {/* Enhanced API Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-300 shadow-sm">
                <div className={`w-3 h-3 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                    apiStatus === 'checking' ? 'bg-amber-500 animate-ping' :
                      'bg-red-500'
                  }`} />
                <span className="text-sm font-medium text-gray-700">
                  {apiStatus === 'connected' ? t("api_connected") :
                    apiStatus === 'checking' ? t("connecting") :
                      t("api_disconnected")}
                </span>
                <button
                  onClick={checkApiHealth}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                  title={t("check_api_status")}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("doc_dashboard_stats.total_processed")}</p>
                  <p className="text-2xl font-bold text-gray-900">{processingHistory.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("doc_dashboard_stats.current_file")}</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {selectedFile ? '1' : '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-emerald-600 text-lg">📄</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("doc_dashboard_stats.api_status")}</p>
                  <p className={`text-2xl font-bold ${apiStatus === 'connected' ? 'text-emerald-600' :
                      apiStatus === 'checking' ? 'text-amber-600' :
                        'text-red-600'
                    }`}>
                    {apiStatus === 'connected' ? t("status_online") : t("status_offline")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-600 text-lg">🔌</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("doc_dashboard_stats.active_processing")}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {processing ? '1' : '0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 text-lg">⚡</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 text-lg">{t("processing_error")}</h3>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Upload and Processing */}
          <div className="xl:col-span-1 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-1">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'upload'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  📤 {t("doc_tabs.upload")}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'history'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  📚 {t("doc_tabs.history")}
                </button>
              </div>
            </div>

            {activeTab === 'upload' ? (
              <>
                <DocumentUpload
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  disabled={apiStatus !== 'connected' || processing}
                />

                <DocumentProcessor
                  selectedFile={selectedFile}
                  onProcessingStart={() => setProcessing(true)}
                  onProcessingComplete={handleProcessingComplete}
                  onProcessingError={handleProcessingError}
                  processing={processing}
                  apiConnected={apiStatus === 'connected'}
                />
              </>
            ) : (
              <ProcessingHistory
                history={processingHistory}
                onLoadDocument={loadDocumentFromHistory}
                currentDocumentId={currentDocument?.id}
              />
            )}
          </div>

          {/* Right Column - Results */}
          <div className="xl:col-span-3">
            <ExtractedEntities
              document={currentDocument}
              onClear={clearCurrentDocument}
              processing={processing}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 inline-block">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                {t("supports_formats")}
              </span>
              <span className="text-gray-300">•</span>
              <span>{t("ai_ocr_ner")}</span>
              <span className="text-gray-300">•</span>
              <span>{t("multi_language_support")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}