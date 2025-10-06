import React, { useState } from 'react';
import type { ClaimCase, StepInstance} from '../types/claimProcess';
import { STEP_STATUSES, STEP_DISPLAY_NAMES } from '../types/claimProcess';
import { DocumentUploader } from './DocumentUploader';
import { useWorkflowSteps } from '../hooks/useWorkflowSteps';
import { useTranslation } from 'react-i18next';

interface StepDetailPanelProps {
  case: ClaimCase;
  step: StepInstance;
}

export const StepDetailPanel: React.FC<StepDetailPanelProps> = ({ case: claimCase, step }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'actions'>('details');
  const { updateStep, proceedToNext } = useWorkflowSteps(claimCase.id);
  const [updating, setUpdating] = useState(false);
  const { t } = useTranslation();

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdating(true);
      await updateStep(step.id, newStatus);
    } catch (error) {
      console.error('Failed to update step:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleProceedToNext = async () => {
    try {
      setUpdating(true);
      await proceedToNext();
    } catch (error) {
      console.error('Failed to proceed:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStepDescription = (stepType: string) => {
    const descriptions: Record<string, string> = {
      gram_sabha_meeting: t('step_descriptions.gram_sabha_meeting'),
      frc_meeting: t('step_descriptions.frc_meeting'),
      visual_mapping: t('step_descriptions.visual_mapping'),
      noc_process: t('step_descriptions.noc_process'),
      verification: t('step_descriptions.verification'),
      gram_sabha_presentation: t('step_descriptions.gram_sabha_presentation'),
      sdlc_review: t('step_descriptions.sdlc_review'),
      dlc_approval: t('step_descriptions.dlc_approval')
    };
    return descriptions[stepType] || 'Process step for FRA claim';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case STEP_STATUSES.COMPLETED:
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: '✅',
          color: 'text-emerald-600'
        };
      case STEP_STATUSES.IN_PROGRESS:
        return {
          bg: 'bg-forest-100 text-forest-800 border-forest-200',
          icon: '🔄',
          color: 'text-forest-600'
        };
      case STEP_STATUSES.AWAITING_REVIEW:
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: '⏳',
          color: 'text-amber-600'
        };
      default:
        return {
          bg: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '⏸️',
          color: 'text-gray-600'
        };
    }
  };

  const statusConfig = getStatusConfig(step.step_status);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-forest-50 via-white to-emerald-50 border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-forest-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">{step.step_order}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {STEP_DISPLAY_NAMES[step.step_type] || step.step_type.replace(/_/g, ' ')}
                </h2>
                <p className="text-gray-600 mt-1">{getStepDescription(step.step_type)}</p>
              </div>
            </div>
            
            {/* Step Progress */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Progress:</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-forest-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(step.step_order / claimCase.steps.length) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-gray-600">Step {step.step_order} of {claimCase.steps.length}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${statusConfig.bg} shadow-sm`}>
              <span>{statusConfig.icon}</span>
              <span>{t(`step_status.${step.step_status}`)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {step.started_at && `Started: ${new Date(step.started_at).toLocaleDateString()}`}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex">
          {(['details', 'documents', 'actions'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-4 px-1 text-center font-medium text-sm capitalize border-b-2 transition-all duration-200 ${
                activeTab === tab
                  ? 'border-forest-500 text-forest-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <div className="flex items-center justify-center gap-2">
                {tab === 'details' }
                {tab === 'documents'}
                {tab === 'actions'}
                {t(`step_detail_panel.tabs.${tab}`)}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Step Information Card */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-forest-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {t('step_detail_panel.step_information')}
                </h3>
                <dl className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">{t('step_detail_panel.step_number')}</dt>
                    <dd className="text-sm font-semibold text-gray-900">{step.step_order}</dd>
                  </div>
                  {step.started_at && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <dt className="text-sm font-medium text-gray-500">{t('step_detail_panel.started')}</dt>
                      <dd className="text-sm text-gray-900">{new Date(step.started_at).toLocaleDateString()}</dd>
                    </div>
                  )}
                  {step.completed_at && (
                    <div className="flex justify-between items-center py-2">
                      <dt className="text-sm font-medium text-gray-500">{t('step_detail_panel.completed')}</dt>
                      <dd className="text-sm text-gray-900">{new Date(step.completed_at).toLocaleDateString()}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Meeting Details Card */}
              {(step.meeting_date || step.meeting_location) && (
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {t('step_detail_panel.meeting_details')}
                  </h3>
                  <dl className="space-y-3">
                    {step.meeting_date && (
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <dt className="text-sm font-medium text-gray-500">{t('step_detail_panel.meeting_date')}</dt>
                        <dd className="text-sm font-semibold text-gray-900">{new Date(step.meeting_date).toLocaleDateString()}</dd>
                      </div>
                    )}
                    {step.meeting_location && (
                      <div className="flex justify-between items-center py-2">
                        <dt className="text-sm font-medium text-gray-500">{t('step_detail_panel.location')}</dt>
                        <dd className="text-sm text-gray-900">{step.meeting_location}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>

            {/* Participants Grid */}
            {step.participants && step.participants.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {t('step_detail_panel.participants')} ({step.participants.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {step.participants.map((participant, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-100 hover:border-amber-300 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {participant.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{participant.name}</div>
                        <div className="text-sm text-gray-500">{participant.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decisions & Notes Grid */}
            {(step.decisions_made || step.verification_notes) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {step.decisions_made && (
                  <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      {t('step_detail_panel.decisions_made')}
                    </h3>
                    <div className="bg-white rounded-lg p-4 border border-emerald-100">
                      <p className="text-sm text-gray-700 leading-relaxed">{step.decisions_made}</p>
                    </div>
                  </div>
                )}
                {step.verification_notes && (
                  <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200 p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      {t('step_detail_panel.verification_notes')}
                    </h3>
                    <div className="bg-white rounded-lg p-4 border border-amber-100">
                      <p className="text-sm text-gray-700 leading-relaxed">{step.verification_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <DocumentUploader
              caseId={claimCase.id}
              stepInstanceId={step.id}
              existingDocuments={step.documents}
            />
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-6">
            {/* Action Cards */}
            <div className="grid grid-cols-1 gap-4">
              {step.step_status === STEP_STATUSES.NOT_STARTED && (
                <div className="bg-gradient-to-br from-forest-50 to-white rounded-xl border border-forest-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('actions.start_this_step')}</h3>
                  <button
                    onClick={() => handleStatusUpdate(STEP_STATUSES.IN_PROGRESS)}
                    disabled={updating}
                    className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {updating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    )}
                    {t('actions.start_this_step')}
                  </button>
                </div>
              )}

              {step.step_status === STEP_STATUSES.IN_PROGRESS && (
                <>
                  <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('actions.mark_as_completed')}</h3>
                    <button
                      onClick={() => handleStatusUpdate(STEP_STATUSES.COMPLETED)}
                      disabled={updating}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none"
                    >
                      {updating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {t('actions.mark_as_completed')}
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('actions.send_for_review')}</h3>
                    <button
                      onClick={() => handleStatusUpdate(STEP_STATUSES.AWAITING_REVIEW)}
                      disabled={updating}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none"
                    >
                      {updating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {t('actions.send_for_review')}
                    </button>
                  </div>
                </>
              )}

              {step.step_status === STEP_STATUSES.AWAITING_REVIEW && (
                <>
                  <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('actions.approve_and_complete')}</h3>
                    <button
                      onClick={() => handleStatusUpdate(STEP_STATUSES.COMPLETED)}
                      disabled={updating}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none"
                    >
                      {updating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {t('actions.approve_and_complete')}
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4"> {t('actions.return_for_revisions')}</h3>
                    <button
                      onClick={() => handleStatusUpdate(STEP_STATUSES.IN_PROGRESS)}
                      disabled={updating}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none"
                    >
                      {updating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {t('actions.return_for_revisions')}
                    </button>
                  </div>
                </>
              )}

              {step.step_status === STEP_STATUSES.COMPLETED && (
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4"> {t('actions.proceed_to_next_step')}</h3>
                  <button
                    onClick={handleProceedToNext}
                    disabled={updating}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {updating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    )}
                    {t('actions.proceed_to_next_step')}
                  </button>
                </div>
              )}
            </div>

            {/* Action Guidelines */}
            <div className="bg-gradient-to-br from-forest-50 to-white rounded-xl border border-forest-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-forest-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-3">{t('step_detail_panel.action_guidelines')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-forest-500 rounded-full"></div>
                      {t('step_detail_panel.guidelines_list.documents_uploaded')}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-forest-500 rounded-full"></div>
                      {t('step_detail_panel.guidelines_list.verify_attendance')}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-forest-500 rounded-full"></div>
                      {t('step_detail_panel.guidelines_list.review_maps')}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-forest-500 rounded-full"></div>
                      {t('step_detail_panel.guidelines_list.coordinate_officials')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};