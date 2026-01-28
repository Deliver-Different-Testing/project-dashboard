import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface ImportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  acceptedFormats: string[];
  lastImport?: string;
}

const importTypes: ImportType[] = [
  {
    id: 'zone-charts',
    name: 'Zone Charts',
    description: 'Import carrier zone charts for rate calculations',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
    acceptedFormats: ['CSV', 'XLSX'],
    lastImport: '2024-01-10',
  },
  {
    id: 'fuel-surcharges',
    name: 'Fuel Surcharges',
    description: 'Import fuel surcharge tables from carriers',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 22V12h4v10H3z" />
        <path d="M10 22V8h4v14h-4z" />
        <path d="M17 22V4h4v18h-4z" />
      </svg>
    ),
    acceptedFormats: ['CSV', 'XLSX'],
    lastImport: '2024-01-15',
  },
  {
    id: 'rate-tables',
    name: 'Rate Tables',
    description: 'Import base rate tables for shipping services',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    acceptedFormats: ['CSV', 'XLSX'],
  },
  {
    id: 'service-mappings',
    name: 'Service Mappings',
    description: 'Bulk import job type to carrier service mappings',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    acceptedFormats: ['CSV'],
  },
  {
    id: 'carrier-accounts',
    name: 'Carrier Accounts',
    description: 'Import carrier account configurations',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    acceptedFormats: ['CSV', 'JSON'],
  },
];

export function ImportToolPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!uploadedFile || !selectedType) return;

    setImportStatus('processing');

    // Simulate import
    setTimeout(() => {
      setImportStatus('success');
      setTimeout(() => {
        setImportStatus('idle');
        setUploadedFile(null);
        setSelectedType(null);
      }, 2000);
    }, 2000);
  };

  const selectedImportType = importTypes.find(t => t.id === selectedType);

  return (
    <div className="min-h-screen bg-surface-light">
      <div className="px-6 pt-6 pb-3">
        <PageHeader
          title="Import Tool"
          subtitle="Bulk import data from files"
        />
      </div>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Import Types */}
          <div className="lg:col-span-2">
            <Card>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Select Import Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {importTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedType === type.id
                        ? 'border-brand-cyan bg-brand-cyan/5'
                        : 'border-border bg-white hover:border-brand-cyan/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedType === type.id ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-gray-100 text-text-muted'
                      }`}>
                        {type.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-text-primary">{type.name}</h4>
                          {type.lastImport && (
                            <Badge className="bg-green-100 text-green-700 text-xs">Imported</Badge>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mt-1">{type.description}</p>
                        <p className="text-xs text-text-muted mt-2">
                          Accepts: {type.acceptedFormats.join(', ')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Upload Area */}
          <div>
            <Card>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {selectedImportType ? `Upload ${selectedImportType.name}` : 'Upload File'}
              </h3>

              {!selectedType ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary">Select an import type to continue</p>
                </div>
              ) : (
                <>
                  {/* Dropzone */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      dragActive
                        ? 'border-brand-cyan bg-brand-cyan/5'
                        : uploadedFile
                        ? 'border-green-300 bg-green-50'
                        : 'border-border hover:border-brand-cyan/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".csv,.xlsx,.json"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {uploadedFile ? (
                      <>
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <p className="font-medium text-text-primary">{uploadedFile.name}</p>
                        <p className="text-sm text-text-muted mt-1">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <p className="font-medium text-text-primary">Drop file here or click to upload</p>
                        <p className="text-sm text-text-muted mt-1">
                          {selectedImportType?.acceptedFormats.join(', ')} files supported
                        </p>
                      </>
                    )}
                  </div>

                  {/* Import Button */}
                  <Button
                    variant="primary"
                    className="w-full mt-4"
                    onClick={handleImport}
                    disabled={!uploadedFile || importStatus === 'processing'}
                  >
                    {importStatus === 'processing' ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Importing...
                      </>
                    ) : importStatus === 'success' ? (
                      <>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Import Complete!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Import Data
                      </>
                    )}
                  </Button>
                </>
              )}
            </Card>

            {/* Recent Imports */}
            <Card className="mt-4">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Recent Imports</h3>
              <div className="space-y-2">
                {importTypes.filter(t => t.lastImport).map((type) => (
                  <div key={type.id} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{type.name}</span>
                    <span className="text-text-muted">{type.lastImport}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportToolPage;
