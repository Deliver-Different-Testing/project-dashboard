import { useState, useRef, useEffect, useCallback } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import type { AttachmentTemplate, AttachmentField } from '../types';

// Full Drag-and-Drop Attachment Builder with Field Library

interface AttachmentBuilderTabProps {
  templates: AttachmentTemplate[];
  onSave?: (templates: AttachmentTemplate[]) => void;
}

// Extended field library with categories
const FIELD_LIBRARY = {
  'Job Details': [
    { name: 'Job Number', code: '[JobNumber]' },
    { name: 'Con Note', code: '[ConNote]' },
    { name: 'Date', code: '[Date]' },
    { name: 'Time', code: '[Time]' },
    { name: 'Weight', code: '[Weight]' },
    { name: 'Quantity', code: '[Quantity]' },
    { name: 'Description', code: '[Description]' },
  ],
  'Pickup Address': [
    { name: 'Company Name', code: '[PickupCompany]' },
    { name: 'Contact', code: '[PickupContact]' },
    { name: 'Street', code: '[PickupStreet]' },
    { name: 'City', code: '[PickupCity]' },
    { name: 'State/Zip', code: '[PickupStateZip]' },
  ],
  'Delivery Address': [
    { name: 'Company Name', code: '[DeliveryCompany]' },
    { name: 'Contact', code: '[DeliveryContact]' },
    { name: 'Street', code: '[DeliveryStreet]' },
    { name: 'City', code: '[DeliveryCity]' },
    { name: 'State/Zip', code: '[DeliveryStateZip]' },
  ],
  'Barcodes & Images': [
    { name: 'Barcode', code: '[Barcode]' },
    { name: 'QR Code', code: '[QRCode]' },
    { name: 'Logo', code: '[Logo]' },
    { name: 'Signature', code: '[Signature]' },
  ],
};

export function AttachmentBuilderTab({ templates, onSave }: AttachmentBuilderTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<AttachmentTemplate | null>(templates[0] || null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [localTemplates, setLocalTemplates] = useState(templates);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({ 'Job Details': true });
  const [fieldSearch, setFieldSearch] = useState('');
  const [zoom, setZoom] = useState(100);
  const [fieldCounter, setFieldCounter] = useState(100);

  // Drag state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    isResizing: boolean;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    startWidth: number;
    startHeight: number;
    resizeDirection: string | null;
  }>({
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    startWidth: 0,
    startHeight: 0,
    resizeDirection: null,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedField = selectedTemplate?.fields.find(f => f.id === selectedFieldId) || null;

  // Filter fields based on search
  const filteredLibrary = Object.entries(FIELD_LIBRARY).reduce((acc, [category, fields]) => {
    const filtered = fields.filter(f =>
      f.name.toLowerCase().includes(fieldSearch.toLowerCase()) ||
      f.code.toLowerCase().includes(fieldSearch.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof FIELD_LIBRARY[keyof typeof FIELD_LIBRARY]>);

  // Handle drag start from field library
  const handleDragStart = (e: React.DragEvent, fieldCode: string, fieldName: string) => {
    e.dataTransfer.setData('fieldCode', fieldCode);
    e.dataTransfer.setData('fieldName', fieldName);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drop on canvas
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !canvasRef.current) return;

    const fieldCode = e.dataTransfer.getData('fieldCode');
    const fieldName = e.dataTransfer.getData('fieldName');
    if (!fieldCode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = Math.round((e.clientX - rect.left) / scale);
    const y = Math.round((e.clientY - rect.top) / scale);

    // Create new field
    const newField: AttachmentField = {
      id: `field-${fieldCounter}`,
      label: fieldName,
      mergeField: fieldCode,
      x: Math.max(0, x - 100), // Center on drop point
      y: Math.max(0, y - 20),
      width: 200,
      height: 40,
      fontSize: 14,
      fontFamily: 'Arial',
      fontColor: '#0d0c2c',
      alignment: 'left',
      isBold: false,
      isItalic: false,
    };

    setFieldCounter(prev => prev + 1);

    const updatedTemplate = {
      ...selectedTemplate,
      fields: [...selectedTemplate.fields, newField],
    };

    setSelectedTemplate(updatedTemplate);
    setLocalTemplates(localTemplates.map(t =>
      t.id === updatedTemplate.id ? updatedTemplate : t
    ));
    setSelectedFieldId(newField.id);
  };

  // Handle field mouse down for dragging
  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    e.stopPropagation();

    const field = selectedTemplate?.fields.find(f => f.id === fieldId);
    if (!field) return;

    setSelectedFieldId(fieldId);
    setDragState({
      isDragging: true,
      isResizing: false,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: field.x,
      startTop: field.y,
      startWidth: field.width,
      startHeight: field.height,
      resizeDirection: null,
    });
  };

  // Handle resize handle mouse down
  const handleResizeMouseDown = (e: React.MouseEvent, fieldId: string, direction: string) => {
    e.stopPropagation();

    const field = selectedTemplate?.fields.find(f => f.id === fieldId);
    if (!field) return;

    setSelectedFieldId(fieldId);
    setDragState({
      isDragging: false,
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: field.x,
      startTop: field.y,
      startWidth: field.width,
      startHeight: field.height,
      resizeDirection: direction,
    });
  };

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!selectedTemplate || !selectedFieldId) return;

    const scale = zoom / 100;
    const dx = (e.clientX - dragState.startX) / scale;
    const dy = (e.clientY - dragState.startY) / scale;

    if (dragState.isDragging) {
      updateField(selectedFieldId, {
        x: Math.max(0, Math.round(dragState.startLeft + dx)),
        y: Math.max(0, Math.round(dragState.startTop + dy)),
      });
    } else if (dragState.isResizing && dragState.resizeDirection) {
      const dir = dragState.resizeDirection;
      const updates: Partial<AttachmentField> = {};

      if (dir.includes('e')) {
        updates.width = Math.max(50, Math.round(dragState.startWidth + dx));
      }
      if (dir.includes('w')) {
        const newWidth = Math.max(50, Math.round(dragState.startWidth - dx));
        updates.width = newWidth;
        updates.x = Math.round(dragState.startLeft + (dragState.startWidth - newWidth));
      }
      if (dir.includes('s')) {
        updates.height = Math.max(20, Math.round(dragState.startHeight + dy));
      }
      if (dir.includes('n')) {
        const newHeight = Math.max(20, Math.round(dragState.startHeight - dy));
        updates.height = newHeight;
        updates.y = Math.round(dragState.startTop + (dragState.startHeight - newHeight));
      }

      updateField(selectedFieldId, updates);
    }
  }, [dragState, selectedFieldId, selectedTemplate, zoom]);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      isResizing: false,
      resizeDirection: null,
    }));
  }, []);

  // Add/remove mouse listeners
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, dragState.isResizing, handleMouseMove, handleMouseUp]);

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
  };

  const deleteField = (fieldId: string) => {
    if (!selectedTemplate) return;

    const updatedTemplate = {
      ...selectedTemplate,
      fields: selectedTemplate.fields.filter(f => f.id !== fieldId),
    };

    setSelectedTemplate(updatedTemplate);
    setLocalTemplates(localTemplates.map(t =>
      t.id === updatedTemplate.id ? updatedTemplate : t
    ));
    setSelectedFieldId(null);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSave = () => {
    onSave?.(localTemplates);
  };

  const categoryIcons: Record<string, string> = {
    'Job Details': '📦',
    'Pickup Address': '📍',
    'Delivery Address': '🎯',
    'Barcodes & Images': '📊',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Attachment Builder</h3>
          <p className="text-sm text-text-secondary mt-1">
            Design PDF/image attachments by dragging fields onto the canvas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-light rounded-lg px-3 py-1.5">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="text-text-secondary hover:text-text-primary"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="text-sm font-medium text-text-primary w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 25))}
              className="text-text-secondary hover:text-text-primary"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <Button variant="primary" size="sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Template List */}
        <div className="col-span-2">
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="p-3 bg-surface-light border-b border-border">
              <h4 className="text-sm font-medium text-text-secondary">Templates</h4>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {localTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'bg-brand-cyan/10 border-l-4 border-l-brand-cyan'
                      : 'hover:bg-surface-light border-l-4 border-l-transparent'
                  }`}
                  onClick={() => { setSelectedTemplate(template); setSelectedFieldId(null); }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-text-primary truncate">{template.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={template.isActive ? 'green' : 'default'} size="sm">
                      {template.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-text-muted">{template.fields.length} fields</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="col-span-7">
          {selectedTemplate ? (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="p-3 bg-surface-light border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-medium text-text-secondary">Canvas</h4>
                  <Badge variant="blue" size="sm">{selectedTemplate.fields.length} fields</Badge>
                </div>
                <span className="text-xs text-text-muted">
                  {selectedTemplate.width} × {selectedTemplate.height}px
                </span>
              </div>
              <div
                className="p-6 bg-gray-100 overflow-auto"
                style={{ minHeight: '500px', maxHeight: '600px' }}
              >
                {/* Canvas */}
                <div
                  ref={canvasRef}
                  className="relative bg-white shadow-lg mx-auto select-none"
                  style={{
                    width: selectedTemplate.width,
                    height: selectedTemplate.height,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top left',
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleCanvasDrop}
                  onClick={() => setSelectedFieldId(null)}
                >
                  {/* Grid */}
                  <svg className="absolute inset-0 opacity-10 pointer-events-none" width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#999" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Template background guide lines */}
                  <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                    {/* Header area */}
                    <rect x="20" y="20" width={selectedTemplate.width - 40} height="80" fill="none" stroke="#ddd" strokeDasharray="4" />
                    <text x="30" y="40" fontSize="10" fill="#999">HEADER</text>

                    {/* Address areas */}
                    <rect x="20" y="120" width={(selectedTemplate.width - 60) / 2} height="120" fill="none" stroke="#ddd" strokeDasharray="4" />
                    <text x="30" y="140" fontSize="10" fill="#999">FROM</text>

                    <rect x={(selectedTemplate.width + 20) / 2} y="120" width={(selectedTemplate.width - 60) / 2} height="120" fill="none" stroke="#ddd" strokeDasharray="4" />
                    <text x={(selectedTemplate.width + 30) / 2} y="140" fontSize="10" fill="#999">TO</text>

                    {/* Barcode area */}
                    <rect x="20" y="260" width={selectedTemplate.width - 40} height="80" fill="none" stroke="#ddd" strokeDasharray="4" />
                    <text x="30" y="280" fontSize="10" fill="#999">BARCODE</text>
                  </svg>

                  {/* Drop zone indicator */}
                  <div className="absolute inset-0 border-2 border-dashed border-transparent hover:border-brand-cyan/30 transition-colors pointer-events-none" />

                  {/* Fields */}
                  {selectedTemplate.fields.map((field) => {
                    const isSelected = selectedFieldId === field.id;
                    const isDragging = isSelected && dragState.isDragging;

                    return (
                      <div
                        key={field.id}
                        className={`absolute cursor-move transition-shadow ${
                          isSelected
                            ? 'ring-2 ring-brand-cyan shadow-lg z-10'
                            : 'hover:ring-1 hover:ring-brand-cyan/50'
                        } ${isDragging ? 'opacity-80' : ''}`}
                        style={{
                          left: field.x,
                          top: field.y,
                          width: field.width,
                          height: field.height,
                          backgroundColor: isSelected ? 'rgba(0, 188, 212, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                          border: `2px ${isSelected ? 'solid' : 'dashed'} ${isSelected ? '#00bcd4' : '#ccc'}`,
                        }}
                        onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
                      >
                        {/* Field content */}
                        <div
                          className="w-full h-full flex items-center overflow-hidden px-2"
                          style={{
                            fontSize: field.fontSize,
                            fontFamily: field.fontFamily,
                            color: field.fontColor,
                            fontWeight: field.isBold ? 'bold' : 'normal',
                            fontStyle: field.isItalic ? 'italic' : 'normal',
                            justifyContent: field.alignment === 'center' ? 'center' : field.alignment === 'right' ? 'flex-end' : 'flex-start',
                          }}
                        >
                          {field.mergeField}
                        </div>

                        {/* Resize handles (only when selected) */}
                        {isSelected && (
                          <>
                            {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map((dir) => (
                              <div
                                key={dir}
                                className={`resize-handle absolute w-3 h-3 bg-brand-cyan border border-white rounded-sm cursor-${
                                  dir === 'n' || dir === 's' ? 'ns' :
                                  dir === 'e' || dir === 'w' ? 'ew' :
                                  dir === 'nw' || dir === 'se' ? 'nwse' : 'nesw'
                                }-resize`}
                                style={{
                                  ...(dir.includes('n') && { top: -6 }),
                                  ...(dir.includes('s') && { bottom: -6 }),
                                  ...(!dir.includes('n') && !dir.includes('s') && { top: '50%', marginTop: -6 }),
                                  ...(dir.includes('w') && { left: -6 }),
                                  ...(dir.includes('e') && { right: -6 }),
                                  ...(!dir.includes('w') && !dir.includes('e') && { left: '50%', marginLeft: -6 }),
                                }}
                                onMouseDown={(e) => handleResizeMouseDown(e, field.id, dir)}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-lg p-12 text-center text-text-muted h-[500px] flex flex-col items-center justify-center">
              <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <p className="text-lg font-medium">Select a template</p>
              <p className="text-sm mt-1">Choose a template from the list to start editing</p>
            </div>
          )}
        </div>

        {/* Right Panel: Field Library + Properties */}
        <div className="col-span-3 space-y-4">
          {/* Field Library */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="p-3 bg-surface-light border-b border-border">
              <h4 className="text-sm font-medium text-text-secondary">Field Library</h4>
              <p className="text-xs text-text-muted mt-0.5">Drag fields onto canvas</p>
            </div>

            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={fieldSearch}
                  onChange={(e) => setFieldSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="max-h-[250px] overflow-y-auto">
              {Object.entries(filteredLibrary).map(([category, fields]) => (
                <div key={category} className="border-b border-border last:border-b-0">
                  <button
                    className="w-full flex items-center justify-between p-2.5 hover:bg-surface-light transition-colors"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{categoryIcons[category]}</span>
                      <span className="text-sm font-medium text-text-primary">{category}</span>
                      <Badge variant="default" size="sm">{fields.length}</Badge>
                    </div>
                    <svg
                      className={`w-4 h-4 text-text-muted transition-transform ${expandedCategories[category] ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {expandedCategories[category] && (
                    <div className="pb-2 px-2">
                      {fields.map((field) => (
                        <div
                          key={field.code}
                          draggable
                          onDragStart={(e) => handleDragStart(e, field.code, field.name)}
                          className="flex items-center justify-between p-2 mb-1 bg-surface-light rounded cursor-grab hover:bg-brand-cyan/10 hover:border-brand-cyan border border-transparent transition-colors active:cursor-grabbing"
                        >
                          <span className="text-sm text-text-primary">{field.name}</span>
                          <code className="text-xs text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded">
                            {field.code}
                          </code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Field Properties */}
          {selectedField ? (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="p-3 bg-brand-cyan/10 border-b border-border flex items-center justify-between">
                <h4 className="text-sm font-medium text-brand-cyan">Field Properties</h4>
                <button
                  onClick={() => deleteField(selectedField.id)}
                  className="text-red-500 hover:text-red-600 p-1"
                  title="Delete field"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
              <div className="p-3 space-y-3">
                {/* Field Name */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Field</label>
                  <input
                    type="text"
                    value={selectedField.mergeField}
                    readOnly
                    className="w-full px-2 py-1.5 text-sm bg-surface-light border border-border rounded"
                  />
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">X</label>
                    <input
                      type="number"
                      value={selectedField.x}
                      onChange={(e) => updateField(selectedField.id, { x: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded focus:border-brand-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Y</label>
                    <input
                      type="number"
                      value={selectedField.y}
                      onChange={(e) => updateField(selectedField.id, { y: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded focus:border-brand-cyan focus:outline-none"
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
                      onChange={(e) => updateField(selectedField.id, { width: parseInt(e.target.value) || 50 })}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded focus:border-brand-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Height</label>
                    <input
                      type="number"
                      value={selectedField.height}
                      onChange={(e) => updateField(selectedField.id, { height: parseInt(e.target.value) || 20 })}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded focus:border-brand-cyan focus:outline-none"
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
                      onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) || 12 })}
                      min={8}
                      max={72}
                      className="w-full px-2 py-1.5 text-sm border border-border rounded focus:border-brand-cyan focus:outline-none"
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
                        className={`flex-1 py-1.5 text-xs border rounded transition-colors ${
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
                <div className="flex gap-4 pt-2 border-t border-border">
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
              <div className="p-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedTemplate.name}
                    readOnly
                    className="w-full px-2 py-1.5 text-sm bg-surface-light border border-border rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Status</span>
                  <Toggle checked={selectedTemplate.isActive} onChange={() => {}} />
                </div>
                <div className="pt-3 border-t border-border">
                  <Button variant="primary" size="sm" className="w-full" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
