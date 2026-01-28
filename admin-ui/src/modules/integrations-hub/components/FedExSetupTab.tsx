import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { fedExSetupSteps } from '../data/sampleData';
import type { FedExSetupStep } from '../types';

export function FedExSetupTab() {
  const [steps, setSteps] = useState<FedExSetupStep[]>(fedExSetupSteps);

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  const getStepIcon = (status: FedExSetupStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        );
      case 'in_progress':
        return (
          <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin" />
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
          </div>
        );
    }
  };

  const getStepAction = (step: FedExSetupStep) => {
    switch (step.status) {
      case 'completed':
        return (
          <span className="text-sm text-green-600 font-medium">Completed</span>
        );
      case 'in_progress':
        return (
          <Button variant="primary" size="sm">
            Continue
          </Button>
        );
      case 'error':
        return (
          <Button variant="danger" size="sm">
            Retry
          </Button>
        );
      default:
        return (
          <Button variant="secondary" size="sm" disabled>
            Start
          </Button>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900">FedEx Integration Setup</h3>
            <p className="text-sm text-purple-700">
              {completedSteps} of {totalSteps} steps completed
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-4 rounded-lg border transition-all ${
              step.status === 'in_progress'
                ? 'bg-brand-cyan/5 border-brand-cyan'
                : step.status === 'completed'
                ? 'bg-green-50/50 border-green-200'
                : step.status === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-white border-border'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Step Number & Icon */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-muted w-6">
                  {index + 1}.
                </span>
                {getStepIcon(step.status)}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium ${
                  step.status === 'completed' ? 'text-green-700' : 'text-text-primary'
                }`}>
                  {step.title}
                </h4>
                <p className="text-sm text-text-secondary">{step.description}</p>
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                {getStepAction(step)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="p-4 rounded-lg bg-gray-50 border border-border">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-text-muted mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <h4 className="font-medium text-text-primary mb-1">Need help?</h4>
            <p className="text-sm text-text-secondary">
              Visit the{' '}
              <a href="https://developer.fedex.com" target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">
                FedEx Developer Portal
              </a>
              {' '}for API documentation and support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
