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

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      [STEP_STATUSES.NOT_STARTED]: t('step_status.not_started'),
      [STEP_STATUSES.IN_PROGRESS]: t('step_status.in_progress'),
      [STEP_STATUSES.AWAITING_REVIEW]: t('step_status.awaiting_review'),
      [STEP_STATUSES.COMPLETED]: t('step_status.completed')
    };
    return statusMap[status] || status.replace(/_/g, ' ');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {STEP_DISPLAY_NAMES[step.step_type] || step.step_type.replace(/_/g, ' ')}
            </h2>
            <p className="text-gray-600 mt-1">{getStepDescription(step.step_type)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              step.step_status === STEP_STATUSES.COMPLETED ? 'bg-green-100 text-green-800' :
              step.step_status === STEP_STATUSES.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
              step.step_status === STEP_STATUSES.AWAITING_REVIEW ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {getStatusDisplay(step.step_status)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {(['details', 'documents', 'actions'] as const).map((tab) => (
            <button
              key={tab}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {t(`step_detail_panel.tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('step_detail_panel.step_information')}</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('step_detail_panel.step_number')}</dt>
                    <dd className="text-sm text-gray-900">{step.step_order} {t('step_detail_panel.of')} {claimCase.steps.length}</dd>
                  </div>
                  {step.started_at && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('step_detail_panel.started')}</dt>
                      <dd className="text-sm text-gray-900">{new Date(step.started_at).toLocaleDateString()}</dd>
                    </div>
                  )}
                  {step.completed_at && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('step_detail_panel.completed')}</dt>
                      <dd className="text-sm text-gray-900">{new Date(step.completed_at).toLocaleDateString()}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('step_detail_panel.meeting_details')}</h3>
                <dl className="space-y-3">
                  {step.meeting_date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('step_detail_panel.meeting_date')}</dt>
                      <dd className="text-sm text-gray-900">{new Date(step.meeting_date).toLocaleDateString()}</dd>
                    </div>
                  )}
                  {step.meeting_location && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('step_detail_panel.location')}</dt>
                      <dd className="text-sm text-gray-900">{step.meeting_location}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Participants */}
            {step.participants && step.participants.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('step_detail_panel.participants')}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {step.participants.map((participant, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{participant.name}</div>
                          <div className="text-sm text-gray-500">{participant.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Decisions & Notes */}
            {(step.decisions_made || step.verification_notes) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {step.decisions_made && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('step_detail_panel.decisions_made')}</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-900">{step.decisions_made}</p>
                    </div>
                  </div>
                )}
                {step.verification_notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('step_detail_panel.verification_notes')}</h3>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-yellow-900">{step.verification_notes}</p>
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
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('step_detail_panel.step_actions')}</h3>
              
              <div className="space-y-4">
                {step.step_status === STEP_STATUSES.NOT_STARTED && (
                  <button
                    onClick={() => handleStatusUpdate(STEP_STATUSES.IN_PROGRESS)}
                    disabled={updating}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('actions.start_this_step')}
                  </button>
                )}

                {step.step_status === STEP_STATUSES.IN_PROGRESS && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleStatusUpdate(STEP_STATUSES.COMPLETED)}
                      disabled={updating}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('actions.mark_as_completed')}
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(STEP_STATUSES.AWAITING_REVIEW)}
                      disabled={updating}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('actions.send_for_review')}
                    </button>
                  </div>
                )}

                {step.step_status === STEP_STATUSES.AWAITING_REVIEW && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleStatusUpdate(STEP_STATUSES.COMPLETED)}
                      disabled={updating}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('actions.approve_and_complete')}
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(STEP_STATUSES.IN_PROGRESS)}
                      disabled={updating}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('actions.return_for_revisions')}
                    </button>
                  </div>
                )}

                {step.step_status === STEP_STATUSES.COMPLETED && (
                  <button
                    onClick={handleProceedToNext}
                    disabled={updating}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    {t('actions.proceed_to_next_step')}
                  </button>
                )}
              </div>
            </div>

            {/* Action Guidelines */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">{t('step_detail_panel.action_guidelines')}</p>
                  <ul className="space-y-1">
                    <li>• {t('step_detail_panel.guidelines_list.documents_uploaded')}</li>
                    <li>• {t('step_detail_panel.guidelines_list.verify_attendance')}</li>
                    <li>• {t('step_detail_panel.guidelines_list.review_maps')}</li>
                    <li>• {t('step_detail_panel.guidelines_list.coordinate_officials')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};