import React, { useState, useEffect } from 'react';
import { ProcessStepper } from './components/ProcessStepper';
import { StepDetailPanel } from './components/StepDetailPanel';
import { useClaimProcess } from './hooks/useClaimProcess';
import type { ClaimCase, StepInstance } from './types/claimProcess';
import { useTranslation } from 'react-i18next';

export const ClaimProcessTracker: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<ClaimCase | null>(null);
  const [currentStep, setCurrentStep] = useState<StepInstance | null>(null);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { cases, loading, error, apiStatus, createCase, checkApiHealth } = useClaimProcess();
  const { t } = useTranslation();

  // Auto-select first case if none selected
  useEffect(() => {
    if (cases.length > 0 && !selectedCase) {
      setSelectedCase(cases[0]);
      setCurrentStep(cases[0].steps.find(s => s.step_status !== 'completed') || cases[0].steps[0]);
    }
  }, [cases, selectedCase]);

  // Filter and search cases
  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.village_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || caseItem.overall_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCreateCase = async (caseData: any) => {
    try {
      const newCase = await createCase(caseData);
      setSelectedCase(newCase);
      setCurrentStep(newCase.steps[0]);
      setShowNewCaseForm(false);
      setViewMode('detailed');
    } catch (err) {
      console.error('Failed to create case:', err);
    }
  };

  // Calculate dashboard statistics
  const dashboardStats = {
    total: cases.length,
    inProgress: cases.filter(c => c.overall_status === 'in_progress').length,
    completed: cases.filter(c => c.overall_status === 'completed').length,
    pending: cases.filter(c => c.overall_status === 'not_started').length,
    avgProgress: cases.length > 0
      ? Math.round(cases.reduce((acc, c) => {
        const completedSteps = c.steps.filter(s => s.step_status === 'completed').length;
        return acc + (completedSteps / c.steps.length) * 100;
      }, 0) / cases.length)
      : 0
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin mb-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-forest-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-gray-600 font-medium text-lg">{t("messages.loading_cases")}</p>
        <p className="text-gray-400 text-sm mt-2">{t("preparing_dashboard")}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900">{t("messages.error_loading_cases")}</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gradient-to-r from-forest-600 to-forest-700 text-white font-medium py-3 rounded-lg hover:from-forest-700 hover:to-forest-800 transition-all duration-200"
        >
          {t("retry_loading")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header with Dashboard */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-forest-600 to-forest-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("claim_process_tracker")}</h1>
                <p className="max-w-100 text-gray-600 text-lg">{t("manage_workflows")}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>{cases.length} {t("active_claims").toLowerCase()}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{t("ministry_tribal_affairs")}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-white rounded-lg border border-gray-300 p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'overview'
                    ? 'bg-forest-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  📊 {t("view_mode.overview")}
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'detailed'
                    ? 'bg-forest-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  🔍 {t("view_mode.detailed")}
                </button>
              </div>

              {/* API Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 shadow-sm">
                <div className={`w-3 h-3 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                  apiStatus === 'checking' ? 'bg-amber-500 animate-ping' :
                    'bg-red-500'
                  }`} />
                <span className="text-sm font-medium text-gray-700">
                  {apiStatus === 'connected' ? t("api_status.connected") :
                    apiStatus === 'checking' ? t("api_status.connecting") :
                      t("api_status.disconnected")}
                </span>
                <button
                  onClick={checkApiHealth}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                  title={t("api_status.check_status")}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => setShowNewCaseForm(true)}
                className="btn bg-gradient-to-br from-forest-600 to-forest-700 border-forest-700 text-white hover:from-forest-700 hover:to-forest-800 shadow-lg px-6"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("create_new_claim")}
              </button>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("dashboard_stats.total_claims")}</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("dashboard_stats.in_progress")}</p>
                  <p className="text-2xl font-bold text-amber-600">{dashboardStats.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-amber-600 text-lg">🔄</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("dashboard_stats.completed")}</p>
                  <p className="text-2xl font-bold text-emerald-600">{dashboardStats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 text-lg">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("dashboard_stats.avg_progress")}</p>
                  <p className="text-2xl font-bold text-forest-600">{dashboardStats.avgProgress}%</p>
                </div>
                <div className="w-12 h-12 bg-forest-100 rounded-lg flex items-center justify-center">
                  <span className="text-forest-600 text-lg">📈</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={t("search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-forest-500 focus:ring-forest-500 bg-white shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 bg-white shadow-sm focus:border-forest-500 focus:ring-forest-500"
              >
                <option value="all">{t("filter_all_status")}</option>
                <option value="not_started">{t("step_status.not_started")}</option>
                <option value="in_progress">{t("step_status.in_progress")}</option>
                <option value="awaiting_review">{t("step_status.awaiting_review")}</option>
                <option value="completed">{t("step_status.completed")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {viewMode === 'overview' ? (
          <div className="space-y-6">
            {/* Cases Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className={`bg-white rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg group ${selectedCase?.id === caseItem.id
                    ? 'border-forest-500 shadow-lg transform scale-[1.02]'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => {
                    setSelectedCase(caseItem);
                    setCurrentStep(caseItem.steps.find(s => s.step_status !== 'completed') || caseItem.steps[0]);
                    setViewMode('detailed');
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-forest-800 transition-colors">
                          {caseItem.case_number}
                        </h3>
                        <p className="text-gray-600 mt-1">{caseItem.village_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${caseItem.overall_status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        caseItem.overall_status === 'in_progress' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          caseItem.overall_status === 'awaiting_review' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                        {t(`step_status.${caseItem.overall_status}`)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{t("case_info.district_state", { district: caseItem.district, state: caseItem.state })}</span>
                        <span className="font-medium">{t(`claim_types.${caseItem.claim_type}`)}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t("case_info.progress")}</span>
                          <span className="font-semibold text-forest-700">
                            {caseItem.steps.filter(s => s.step_status === 'completed').length}/{caseItem.steps.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-forest-500 to-forest-600 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(caseItem.steps.filter(s => s.step_status === 'completed').length / caseItem.steps.length) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          {caseItem.steps.find(s => s.step_status === 'in_progress')?.step_type ?
                            t("status1.working_on", { stepName: t(`step_names.${caseItem.steps.find(s => s.step_status === 'in_progress')?.step_type}`) }) :
                            t("status1.ready_to_start")
                          }
                        </div>
                        <div className="text-forest-600 group-hover:text-forest-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCases.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("messages.no_cases_found")}</h3>
                <p className="text-gray-600 mb-6">{t("no_matching_claims")}</p>
                <button
                  onClick={() => setShowNewCaseForm(true)}
                  className="btn bg-gradient-to-br from-forest-600 to-forest-700 border-forest-700 text-white hover:from-forest-700 hover:to-forest-800 shadow-lg px-8"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t("create_first_claim")}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Detailed View */
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Cases Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">{t("active_claims")}</h2>
                  <span className="text-xs bg-forest-100 text-forest-800 px-2 py-1 rounded-full font-medium">
                    {filteredCases.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {filteredCases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedCase?.id === caseItem.id
                        ? 'border-forest-500 bg-forest-50 shadow-md transform scale-[1.02]'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      onClick={() => {
                        setSelectedCase(caseItem);
                        setCurrentStep(caseItem.steps.find(s => s.step_status !== 'completed') || caseItem.steps[0]);
                      }}
                    >
                      <div className="font-medium text-gray-900">{caseItem.case_number}</div>
                      <div className="text-sm text-gray-600 mt-1">{caseItem.village_name}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{t("case_info.district_state", { district: caseItem.district, state: caseItem.state })}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${caseItem.overall_status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          caseItem.overall_status === 'in_progress' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                          {t(`step_status.${caseItem.overall_status}`)}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-forest-500 to-forest-600 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${(caseItem.steps.filter(s => s.step_status === 'completed').length / caseItem.steps.length) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">
                            {caseItem.steps.filter(s => s.step_status === 'completed').length}/{caseItem.steps.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Process Stepper and Details */}
            <div className="xl:col-span-3">
              {selectedCase ? (
                <div className="space-y-6">
                  <ProcessStepper
                    case={selectedCase}
                    onStepSelect={setCurrentStep}
                    selectedStep={currentStep}
                  />
                  {currentStep && (
                    <StepDetailPanel
                      case={selectedCase}
                      step={currentStep}
                    />
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("no_claim_selected")}</h3>
                  <p className="text-gray-600 mb-6">{t("select_claim_to_view")}</p>
                  <button
                    onClick={() => setShowNewCaseForm(true)}
                    className="btn bg-gradient-to-br from-forest-600 to-forest-700 border-forest-700 text-white hover:from-forest-700 hover:to-forest-800 shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t("create_new_claim")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Case Form Modal */}
        {showNewCaseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-forest-700 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t("new_claim_form.create_new_fra_claim")}</h3>
                  <p className="text-sm text-gray-600">{t("ministry_tribal_affairs")}</p>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateCase({
                  village_name: formData.get('village_name'),
                  district: formData.get('district'),
                  state: formData.get('state'),
                  claim_type: formData.get('claim_type'),
                  applicant_name: formData.get('applicant_name'),
                  applicant_contact: formData.get('applicant_contact'),
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("new_claim_form.village_name")}
                    </label>
                    <input
                      type="text"
                      name="village_name"
                      required
                      className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                      placeholder={t("new_claim_form.enter_village_name")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("new_claim_form.district")}
                      </label>
                      <input
                        type="text"
                        name="district"
                        required
                        className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                        placeholder={t("new_claim_form.district")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("new_claim_form.state")}
                      </label>
                      <select name="state" required className="select select-bordered w-full bg-gray-50 border-gray-300 focus:border-forest-500 focus:ring-forest-500">
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Telangana">Telangana</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("new_claim_form.claim_type")}
                    </label>
                    <select name="claim_type" required className="select select-bordered w-full bg-gray-50 border-gray-300 focus:border-forest-500 focus:ring-forest-500">
                      <option value="individual">{t("claim_types.individual")}</option>
                      <option value="community">{t("claim_types.community")}</option>
                      <option value="cfr">{t("claim_types.cfr")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("new_claim_form.applicant_name")}
                    </label>
                    <input
                      type="text"
                      name="applicant_name"
                      className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                      placeholder={t("new_claim_form.name_of_applicant")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("new_claim_form.applicant_contact")}
                    </label>
                    <input
                      type="text"
                      name="applicant_contact"
                      className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                      placeholder={t("new_claim_form.phone_or_email")}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="submit" className="btn bg-gradient-to-br from-forest-600 to-forest-700 border-forest-700 text-white hover:from-forest-700 hover:to-forest-800 flex-1">
                    {t("create_claim")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCaseForm(false)}
                    className="btn btn-ghost border-gray-300 hover:bg-gray-50"
                  >
                    {t("buttons.cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimProcessTracker;