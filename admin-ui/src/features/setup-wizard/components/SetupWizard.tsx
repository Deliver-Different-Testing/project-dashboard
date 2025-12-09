import React, { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { WizardStepper } from './WizardStepper';
import { WizardModeSelector } from './WizardModeSelector';
import { MissingLinksScanner } from './MissingLinksScanner';
import { ImportWizardModal } from '../../import-export/components';
import { getSchema } from '../../import-export/schemas';
import wizardConfig from '../config/wizard-config.json';
import type { WizardState, WizardStep } from '../types';

export interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  existingData?: Record<string, Record<string, unknown>[]>;  // { clients: [...], depots: [...] }
  onComplete?: () => void;
}

export function SetupWizard({
  isOpen,
  onClose,
  existingData = {},
  onComplete,
}: SetupWizardProps): React.ReactElement {
  // State
  const [state, setState] = useState<WizardState>({
    mode: null,
    currentStepIndex: 0,
    completedSteps: [],
    skippedSteps: [],
  });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [currentSchemaId, setCurrentSchemaId] = useState<string | null>(null);

  // Get steps for current mode
  const steps = useMemo(() => {
    if (state.mode === 'newSetup') {
      return (wizardConfig.modes.newSetup.steps || []) as WizardStep[];
    }
    return [];
  }, [state.mode]);

  // Current step
  const currentStep = steps[state.currentStepIndex];

  // Handlers
  const handleModeSelect = (mode: 'newSetup' | 'maintainImprove') => {
    setState(prev => ({ ...prev, mode, currentStepIndex: 0 }));
  };

  const handleStartImport = () => {
    if (currentStep) {
      setCurrentSchemaId(currentStep.schemaId);
      setImportModalOpen(true);
    }
  };

  const handleSkipStep = () => {
    setState(prev => ({
      ...prev,
      skippedSteps: [...prev.skippedSteps, currentStep.id],
      currentStepIndex: prev.currentStepIndex + 1,
    }));
  };

  const handleImportComplete = () => {
    setImportModalOpen(false);
    setState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, currentStep.id],
      currentStepIndex: prev.currentStepIndex + 1,
    }));
  };

  const handleBack = () => {
    if (state.currentStepIndex > 0) {
      setState(prev => ({ ...prev, currentStepIndex: prev.currentStepIndex - 1 }));
    } else {
      setState(prev => ({ ...prev, mode: null }));
    }
  };

  const handleFinish = () => {
    onComplete?.();
    onClose();
  };

  // Render mode selector if no mode chosen
  if (!state.mode) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Setup Wizard" size="md">
        <WizardModeSelector onSelect={handleModeSelect} />
      </Modal>
    );
  }

  // Render maintain & improve mode
  if (state.mode === 'maintainImprove') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Maintain & Improve"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setState(prev => ({ ...prev, mode: null }))}>
              Back
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        }
      >
        <MissingLinksScanner existingData={existingData} />
      </Modal>
    );
  }

  // Render new setup mode
  const isComplete = state.currentStepIndex >= steps.length;

  return (
    <>
      <Modal
        isOpen={isOpen && !importModalOpen}
        onClose={onClose}
        title="New Setup"
        size="lg"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <div className="flex gap-3">
              {!isComplete && (
                <>
                  <Button variant="ghost" onClick={handleSkipStep}>
                    Skip
                  </Button>
                  <Button variant="primary" onClick={handleStartImport}>
                    Import {currentStep?.label}
                  </Button>
                </>
              )}
              {isComplete && (
                <Button variant="save" onClick={handleFinish}>
                  Finish Setup
                </Button>
              )}
            </div>
          </div>
        }
      >
        <WizardStepper
          steps={steps}
          currentStepIndex={state.currentStepIndex}
          completedSteps={state.completedSteps}
          skippedSteps={state.skippedSteps}
          className="mb-6"
        />

        {!isComplete && currentStep && (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {currentStep.label}
            </h3>
            <p className="text-text-secondary">
              {currentStep.description || `Import your ${currentStep.label.toLowerCase()} data`}
            </p>
          </div>
        )}

        {isComplete && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Setup Complete!
            </h3>
            <p className="text-text-secondary">
              You've completed the initial setup. You can always come back to import more data.
            </p>
          </div>
        )}
      </Modal>

      {/* Import Modal */}
      {currentSchemaId && (
        <ImportWizardModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          schema={getSchema(currentSchemaId)!}
          existingData={existingData[currentSchemaId] || []}
          onComplete={handleImportComplete}
        />
      )}
    </>
  );
}
