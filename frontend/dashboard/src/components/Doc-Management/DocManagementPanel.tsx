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

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

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
      setError(err instanceof Error ? err.message : 'Failed to connect to API');
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentDocument(null);
    setError(null);
  };

  const handleProcessingComplete = (result: any) => {
    // Backend now returns camelCase fields directly
    const processedDoc: ProcessedDocument = {
      id: result.id,
      filename: result.filename,
      extractedText: result.extractedText,
      detectedLanguage: result.detectedLanguage,
      entities: result.entities,
      processedAt: result.processedAt,
      aiProvider: result.aiProvider
    };

    setCurrentDocument(processedDoc);
    setProcessingHistory(prev => [processedDoc, ...prev.slice(0, 9)]);
    setProcessing(false); // CRITICAL: Stop the loading state
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto pb-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("document_management")}</h1>
                <p className="text-gray-600">{t("ocr_processing_desc")}</p>
              </div>
            </div>

            {/* API Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                apiStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                apiStatus === 'checking' ? 'bg-yellow-500 animate-ping' :
                'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600">
                {apiStatus === 'connected' ? t("api_connected") :
                 apiStatus === 'checking' ? t("connecting") :
                 t("api_disconnected")}
              </span>
              <button
                onClick={checkApiHealth}
                className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded"
                title={t("check_api_status")}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-medium text-red-900">{t("processing_error")}</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload and Processing */}
          <div className="lg:col-span-1 space-y-6">
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

            <ProcessingHistory
              history={processingHistory}
              onLoadDocument={loadDocumentFromHistory}
              currentDocumentId={currentDocument?.id}
            />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <ExtractedEntities
              document={currentDocument}
              onClear={clearCurrentDocument}
              processing={processing}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>{t("supports_formats")}</p>
        </div>
      </div>
    </div>
  );
}