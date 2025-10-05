import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ClaimCase, StepInstance} from '../types/claimProcess';
import { STEP_DISPLAY_NAMES, STEP_STATUSES } from '../types/claimProcess';

interface ProcessStepperProps {
  case: ClaimCase;
  onStepSelect: (step: StepInstance) => void;
  selectedStep?: StepInstance | null;
}

export const ProcessStepper: React.FC<ProcessStepperProps> = ({
  case: claimCase,
  onStepSelect,
  selectedStep
}) => {
  const { t } = useTranslation();

  const getStepStatusConfig = (status: string) => {
    switch (status) {
      case STEP_STATUSES.COMPLETED:
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-600',
          ring: 'ring-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          progress: 'from-emerald-500 to-emerald-600'
        };
      case STEP_STATUSES.IN_PROGRESS:
        return {
          bg: 'bg-gradient-to-br from-forest-500 to-forest-600',
          border: 'border-forest-600',
          ring: 'ring-forest-200',
          text: 'text-forest-700',
          badge: 'bg-forest-100 text-forest-800 border-forest-200',
          progress: 'from-forest-500 to-forest-600'
        };
      case STEP_STATUSES.AWAITING_REVIEW:
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-600',
          ring: 'ring-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          progress: 'from-amber-500 to-amber-600'
        };
      default:
        return {
          bg: 'bg-gray-300',
          border: 'border-gray-400',
          ring: 'ring-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          progress: 'from-gray-400 to-gray-500'
        };
    }
  };

  const getStepStatusText = (status: string) => {
    return t(`step_status.${status}`, {
      defaultValue: status.replace(/_/g, ' ')
    });
  };

  const getStepDisplayName = (stepType: string) => {
    return t(`step_names.${stepType}`, {
      defaultValue: STEP_DISPLAY_NAMES[stepType] || stepType.replace(/_/g, ' ')
    });
  };

  const isStepActive = (step: StepInstance) => selectedStep?.id === step.id;

  const formatDocumentCount = (count: number) => {
    return t('documents_count.count', { count, defaultValue: `${count} document(s)` });
  };

  const completedSteps = claimCase.steps.filter(s => s.step_status === STEP_STATUSES.COMPLETED).length;
  const totalSteps = claimCase.steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with Enhanced Progress */}
      <div className="bg-gradient-to-r from-forest-50 to-emerald-50 border-b border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-forest-700 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{t("claim_process_workflow")}</h2>
            <p className="text-gray-600">{t("track_progress")}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-forest-700">{completedSteps}/{totalSteps}</div>
            <div className="text-sm text-gray-600">{t("steps")}</div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">{t("overall_progress")}</span>
            <span className="text-sm font-bold text-forest-700">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-forest-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="p-6">
        <div className="relative">
          
          <div className="space-y-6">
            {claimCase.steps.sort((a, b) => a.step_order - b.step_order).map((step) => {
              const statusConfig = getStepStatusConfig(step.step_status);
              const isActive = isStepActive(step);

              return (
                <div
                  key={step.id}
                  className={`relative flex items-start gap-6 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
                    isActive
                      ? `${statusConfig.border} bg-white shadow-lg ring-4 ${statusConfig.ring} transform scale-[1.02]`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                  }`}
                  onClick={() => onStepSelect(step)}
                >
                  {/* Step Number and Status Indicator */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-bold text-white shadow-lg ${statusConfig.bg} ${statusConfig.border} ${
                      step.step_status === STEP_STATUSES.IN_PROGRESS ? 'animate-pulse' : ''
                    }`}>
                      {step.step_order}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-forest-800 transition-colors">
                          {getStepDisplayName(step.step_type)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{t(`step_descriptions.${step.step_type}`)}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.badge} shadow-sm`}>
                        {getStepStatusText(step.step_status)}
                      </span>
                    </div>

                    {/* Step Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      {step.meeting_date && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">{t('step_detail_panel.meeting_date')}</div>
                            <div className="text-gray-600">{new Date(step.meeting_date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      )}

                      {step.meeting_location && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">{t('step_detail_panel.location')}</div>
                            <div className="text-gray-600">{step.meeting_location}</div>
                          </div>
                        </div>
                      )}

                      {step.documents && step.documents.length > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">{t('documents')}</div>
                            <div className="text-gray-600">{formatDocumentCount(step.documents.length)}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    {step.step_status === STEP_STATUSES.IN_PROGRESS && (
                      <div className="mt-4 flex gap-2">
                        <button 
                          className="text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle mark complete action
                          }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t("actions.mark_complete")}
                        </button>
                        <button 
                          className="text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-sm flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle need review action
                          }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t("actions.need_review")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};