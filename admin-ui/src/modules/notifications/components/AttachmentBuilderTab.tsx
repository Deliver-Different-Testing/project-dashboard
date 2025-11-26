import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import type { AttachmentTemplate, AttachmentField } from '../types';
import { MERGE_FIELDS } from '../types';

interface AttachmentBuilderTabProps {
  templates: AttachmentTemplate[];
  onSave?: (templates: AttachmentTemplate[]) => void;
}

export function AttachmentBuilderTab({ templates, onSave }: AttachmentBuilderTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<AttachmentTemplate | null>(templates[0] || null);
  const [selectedField, setSelectedField] = useState<AttachmentField | null>(null);
  const [localTemplates, setLocalTemplates] = useState(templates);

  const updateField = (fieldId: string, updates: Partial<AttachmentField>) => {
    if (!selectedTemplate) return;

    const updatedTemplate = {
      ...selectedTemplate,
      fields: selectedTemplate.fields.map(f =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    };

    setSelectedTemplate(updatedTemplate);
    setLocalTemplates(localTemplates.map(t =>
      t.id === updatedTemplate.id ? updatedTemplate : t
    ));

    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const handleSave = () => {
    onSave?.(localTemplates);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Attachment Builder</h3>
          <p className="text-sm text-text-secondary mt-1">
            Design and configure PDF/image attachments with merge fields
          </p>
        </div>
        <Button variant="primary" size="sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Template List */}
        <div className="col-span-3">
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="p-3 bg-surface-light border-b border-border">
              <h4 className="text-sm font-medium text-text-secondary">Templates</h4>
            </div>
            <div className="divide-y divide-border">
              {localTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'bg-brand-cyan/10 border-l-4 border-l-brand-cyan'
                      : 'hover:bg-surface-light'
                  }`}
                  onClick={() => { setSelectedTemplate(template); setSelectedField(null); }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-text-primary">{template.name}</span>
                    <Badge variant={template.isActive ? 'green' : 'default'} size="sm">
                      {template.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-1">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="col-span-6">
          {selectedTemplate ? (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="p-3 bg-surface-light border-b border-border flex items-center justify-between">
                <h4 className="text-sm font-medium text-text-secondary">Canvas Preview</h4>
                <span className="text-xs text-text-muted">
                  {selectedTemplate.width} × {selectedTemplate.height}px
                </span>
              </div>
              <div className="p-4 flex items-center justify-center bg-gray-100 min-h-[400px]">
                {/* Canvas */}
                <div
                  className="relative bg-white shadow-lg"
                  style={{
                    width: Math.min(selectedTemplate.width, 380),
                    height: Math.min(selectedTemplate.height, 500),
                    transform: `scale(${Math.min(380 / selectedTemplate.width, 500 / selectedTemplate.height, 1)})`,
                  }}
                >
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#999" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Fields */}
                  {selectedTemplate.fields.map((field) => (
                    <div
                      key={field.id}
                      className={`absolute border-2 cursor-pointer transition-all ${
                        selectedField?.id === field.id
                          ? 'border-brand-cyan bg-brand-cyan/10'
                          : 'border-dashed border-gray-300 hover:border-brand-cyan/50'
                      }`}
                      style={{
                        left: field.x,
                        top: field.y,
                        width: field.width,
                        height: field.height,
                      }}
                      onClick={() => setSelectedField(field)}
                    >
                      <div
                        className="w-full h-full flex items-center overflow-hidden px-1"
                        style={{
                          fontSize: Math.min(field.fontSize, 14),
                          fontFamily: field.fontFamily,
                          color: field.fontColor,
                          fontWeight: field.isBold ? 'bold' : 'normal',
                          fontStyle: field.isItalic ? 'italic' : 'normal',
                          textAlign: field.alignment,
                          justifyContent: field.alignment === 'center' ? 'center' : field.alignment === 'right' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {field.mergeField}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-lg p-12 text-center text-text-muted">
              <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <p>Select a template to preview</p>
            </div>
          )}
        </div>

        {/* Field Properties */}
        <div className="col-span-3">
          {selectedField ? (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="p-3 bg-surface-light border-b border-border">
                <h4 className="text-sm font-medium text-text-secondary">Field Properties</h4>
              </div>
              <div className="p-4 space-y-4">
                {/* Label */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Label</label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-border rounded"
                  />
                </div>

                {/* Merge Field */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Merge Field</label>
                  <select
                    value={selectedField.mergeField}
                    onChange={(e) => updateField(selectedField.id, { mergeField: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-border rounded"
                  >
                    {MERGE_FIELDS.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">X</label>
                    <input
                      type="number"
                      value={selectedField.x}
                      onChange={(e) => updateField(selectedField.id, { x: parseInt(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Y</label>
                    <input
                      type="number"
                      value={selectedField.y}
                      onChange={(e) => updateField(selectedField.id, { y: parseInt(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded"
                    />
                  </div>
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Width</label>
                    <input
                      type="number"
                      value={selectedField.width}
                      onChange={(e) => updateField(selectedField.id, { width: parseInt(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Height</label>
                    <input
                      type="number"
                      value={selectedField.height}
                      onChange={(e) => updateField(selectedField.id, { height: parseInt(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded"
                    />
                  </div>
                </div>

                {/* Font */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Font Size</label>
                    <input
                      type="number"
                      value={selectedField.fontSize}
                      onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Color</label>
                    <input
                      type="color"
                      value={selectedField.fontColor}
                      onChange={(e) => updateField(selectedField.id, { fontColor: e.target.value })}
                      className="w-full h-8 border border-border rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Alignment</label>
                  <div className="flex gap-1">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        className={`flex-1 py-1.5 text-sm border rounded transition-colors ${
                          selectedField.alignment === align
                            ? 'bg-brand-cyan text-white border-brand-cyan'
                            : 'border-border hover:border-brand-cyan'
                        }`}
                        onClick={() => updateField(selectedField.id, { alignment: align })}
                      >
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Toggles */}
                <div className="flex gap-4 pt-2">
                  <Toggle
                    checked={selectedField.isBold}
                    onChange={(checked) => updateField(selectedField.id, { isBold: checked })}
                    label="Bold"
                  />
                  <Toggle
                    checked={selectedField.isItalic}
                    onChange={(checked) => updateField(selectedField.id, { isItalic: checked })}
                    label="Italic"
                  />
                </div>
              </div>
            </div>
          ) : selectedTemplate ? (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="p-3 bg-surface-light border-b border-border">
                <h4 className="text-sm font-medium text-text-secondary">Template Settings</h4>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedTemplate.name}
                    className="w-full px-2 py-1.5 text-sm border border-border rounded"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
                  <textarea
                    value={selectedTemplate.description}
                    className="w-full px-2 py-1.5 text-sm border border-border rounded resize-none"
                    rows={2}
                    readOnly
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Status</span>
                  <Toggle checked={selectedTemplate.isActive} onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Fields</span>
                  <Badge variant="blue">{selectedTemplate.fields.length}</Badge>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="primary" size="sm" className="w-full" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-lg p-8 text-center text-text-muted">
              <p className="text-sm">Select a template to configure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
