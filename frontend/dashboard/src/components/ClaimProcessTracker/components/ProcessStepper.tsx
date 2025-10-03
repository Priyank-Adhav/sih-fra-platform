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

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case STEP_STATUSES.COMPLETED:
        return 'bg-green-500 border-green-600';
      case STEP_STATUSES.IN_PROGRESS:
        return 'bg-blue-500 border-blue-600 animate-pulse';
      case STEP_STATUSES.AWAITING_REVIEW:
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-gray-300 border-gray-400';
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t("claim_process_workflow")}</h2>
          <p className="text-gray-600">{t("track_progress")}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{t("overall_progress")}</span>
          <span className="text-sm text-gray-600">
            {claimCase.steps.filter(s => s.step_status === STEP_STATUSES.COMPLETED).length} / {claimCase.steps.length} {t("steps")}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ 
              width: `${(claimCase.steps.filter(s => s.step_status === STEP_STATUSES.COMPLETED).length / claimCase.steps.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {claimCase.steps.sort((a, b) => a.step_order - b.step_order).map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              isStepActive(step)
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onStepSelect(step)}
          >
            {/* Step Number and Status */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold text-white ${getStepStatusColor(step.step_status)}`}>
                {step.step_order}
              </div>
              {index < claimCase.steps.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-300 flex-1"></div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  {getStepDisplayName(step.step_type)}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  step.step_status === STEP_STATUSES.COMPLETED ? 'bg-green-100 text-green-800' :
                  step.step_status === STEP_STATUSES.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                  step.step_status === STEP_STATUSES.AWAITING_REVIEW ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getStepStatusText(step.step_status)}
                </span>
              </div>

              {/* Step Details */}
              <div className="space-y-2 text-sm text-gray-600">
                {step.meeting_date && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(step.meeting_date).toLocaleDateString()}</span>
                  </div>
                )}

                {step.meeting_location && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{step.meeting_location}</span>
                  </div>
                )}

                {step.documents && step.documents.length > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{formatDocumentCount(step.documents.length)}</span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {step.step_status === STEP_STATUSES.IN_PROGRESS && (
                <div className="mt-3 flex gap-2">
                  <button 
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle mark complete action
                    }}
                  >
                    {t("actions.mark_complete")}
                  </button>
                  <button 
                    className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle need review action
                    }}
                  >
                    {t("actions.need_review")}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};