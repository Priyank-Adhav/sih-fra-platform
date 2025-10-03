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
  const { cases, loading, error, apiStatus, createCase, checkApiHealth } = useClaimProcess();
  const { t } = useTranslation();

  // Auto-select first case if none selected
  useEffect(() => {
    if (cases.length > 0 && !selectedCase) {
      setSelectedCase(cases[0]);
      setCurrentStep(cases[0].steps.find(s => s.step_status !== 'completed') || cases[0].steps[0]);
    }
  }, [cases, selectedCase]);

  const handleCreateCase = async (caseData: any) => {
    try {
      const newCase = await createCase(caseData);
      setSelectedCase(newCase);
      setCurrentStep(newCase.steps[0]);
      setShowNewCaseForm(false);
    } catch (err) {
      console.error('Failed to create case:', err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <span className="ml-3 text-gray-600">{t("messages.loading_cases")}</span>
    </div>
  );

  if (error) return (
    <div className="alert alert-error m-4">
      <span>{t("messages.error_loading_cases")}: {error}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("claim_process_tracker")}</h1>
                <p className="text-gray-600">{t("manage_workflows")}</p>
              </div>
            </div>

            {/* API Status Indicator */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  apiStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  apiStatus === 'checking' ? 'bg-yellow-500 animate-ping' :
                  'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {apiStatus === 'connected' ? t("api_status.connected") :
                   apiStatus === 'checking' ? t("api_status.connecting") :
                   t("api_status.disconnected")}
                </span>
                <button
                  onClick={checkApiHealth}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded"
                  title={t("api_status.check_status")}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => setShowNewCaseForm(true)}
                className="btn btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("create_new_claim")}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cases List - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("active_claims")}</h2>
              <div className="space-y-3">
                {cases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedCase?.id === caseItem.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedCase(caseItem);
                      setCurrentStep(caseItem.steps.find(s => s.step_status !== 'completed') || caseItem.steps[0]);
                    }}
                  >
                    <div className="font-medium text-gray-900">{caseItem.case_number}</div>
                    <div className="text-sm text-gray-600 mt-1">{caseItem.village_name}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">{caseItem.district}, {caseItem.state}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        caseItem.overall_status === 'completed' ? 'bg-green-100 text-green-800' :
                        caseItem.overall_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t(`step_status.${caseItem.overall_status}`)}
                      </span>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="mt-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ 
                              width: `${(caseItem.steps.filter(s => s.step_status === 'completed').length / caseItem.steps.length) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {caseItem.steps.filter(s => s.step_status === 'completed').length}/{caseItem.steps.length} {t("steps")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {cases.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>{t("messages.no_cases_found")}</p>
                  <p className="text-sm mt-1">{t("create_first_claim")}</p>
                  <button
                    onClick={() => setShowNewCaseForm(true)}
                    className="btn btn-primary btn-sm mt-4"
                  >
                    {t("create_first_claim")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Process Stepper and Details - Main Content */}
          <div className="lg:col-span-3">
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
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("no_claim_selected")}</h3>
                <p className="text-gray-600 mb-6">{t("select_claim_to_view")}</p>
                <button
                  onClick={() => setShowNewCaseForm(true)}
                  className="btn btn-primary"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t("create_new_claim")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* New Case Form Modal */}
        {showNewCaseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t("new_claim_form.create_new_fra_claim")}</h3>
              
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("new_claim_form.village_name")}
                    </label>
                    <input
                      type="text"
                      name="village_name"
                      required
                      className="input input-bordered w-full"
                      placeholder={t("new_claim_form.enter_village_name")}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("new_claim_form.district")}
                      </label>
                      <input
                        type="text"
                        name="district"
                        required
                        className="input input-bordered w-full"
                        placeholder={t("new_claim_form.district")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("new_claim_form.state")}
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        className="input input-bordered w-full"
                        placeholder={t("new_claim_form.state")}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("new_claim_form.claim_type")}
                    </label>
                    <select name="claim_type" required className="select select-bordered w-full">
                      <option value="individual">{t("claim_types.individual")}</option>
                      <option value="community">{t("claim_types.community")}</option>
                      <option value="cfr">{t("claim_types.cfr")}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("new_claim_form.applicant_name")}
                    </label>
                    <input
                      type="text"
                      name="applicant_name"
                      className="input input-bordered w-full"
                      placeholder={t("new_claim_form.name_of_applicant")}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("new_claim_form.applicant_contact")}
                    </label>
                    <input
                      type="text"
                      name="applicant_contact"
                      className="input input-bordered w-full"
                      placeholder={t("new_claim_form.phone_or_email")}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button type="submit" className="btn btn-primary flex-1">
                    {t("create_claim")}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowNewCaseForm(false)}
                    className="btn btn-ghost"
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