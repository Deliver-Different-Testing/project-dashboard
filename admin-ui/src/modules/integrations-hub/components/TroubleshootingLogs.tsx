import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../../components/layout/Card';
import { Badge } from '../../../components/ui/Badge';
import { integrationLogsApi } from '../../../api/integrationLogs';
import type { IntegrationLog } from '../../../api/integrationLogs';

const getStatusBadge = (log: IntegrationLog) => {
  if (!log.isSuccess) {
    return <Badge className="bg-red-100 text-red-700">{log.statusCode} Error</Badge>;
  }
  if (log.durationMs > 2000) {
    return <Badge className="bg-amber-100 text-amber-700">{log.statusCode} Slow</Badge>;
  }
  return <Badge className="bg-green-100 text-green-700">{log.statusCode} OK</Badge>;
};

const getCarrierColor = (carrier: string) => {
  switch (carrier.toUpperCase()) {
    case 'FEDEX':
      return 'text-purple-700 bg-purple-100';
    case 'UPS':
      return 'text-amber-700 bg-amber-100';
    case 'USPS':
      return 'text-blue-700 bg-blue-100';
    case 'DHL':
      return 'text-red-700 bg-red-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

interface LogDetailProps {
  logId: number;
}

function LogDetail({ logId }: LogDetailProps) {
  const { data: logDetail, isLoading } = useQuery({
    queryKey: ['integrationLog', logId],
    queryFn: () => integrationLogsApi.getById(logId),
  });

  if (isLoading) {
    return (
      <div className="p-4 border-t border-border bg-white flex justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatJson = (json: string | undefined) => {
    if (!json) return 'No data';
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  return (
    <div className="p-4 border-t border-border bg-white space-y-3">
      <div>
        <div className="text-xs font-medium text-text-secondary mb-1">Request</div>
        <pre className="text-xs font-mono bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto max-h-48">
          {formatJson(logDetail?.requestBody)}
        </pre>
      </div>
      <div>
        <div className="text-xs font-medium text-text-secondary mb-1">Response</div>
        <pre className={`text-xs font-mono p-3 rounded-lg overflow-x-auto max-h-48 ${
          logDetail?.isSuccess ? 'bg-gray-900 text-blue-400' : 'bg-red-950 text-red-400'
        }`}>
          {formatJson(logDetail?.responseBody)}
        </pre>
      </div>
      {logDetail?.errorMessage && (
        <div>
          <div className="text-xs font-medium text-red-600 mb-1">Error</div>
          <p className="text-sm text-red-600">{logDetail.errorMessage}</p>
        </div>
      )}
    </div>
  );
}

export function TroubleshootingLogs() {
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['integrationLogs', filter],
    queryFn: () =>
      integrationLogsApi.getAll({
        isSuccess: filter === 'all' ? undefined : filter === 'success',
        pageSize: 10,
      }),
  });

  const logs = data?.logs || [];

  // Filter logs based on filter selection
  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'error') return !log.isSuccess || log.durationMs > 2000;
    return log.isSuccess && log.durationMs <= 2000;
  });

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Troubleshooting & Logs</h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'success' | 'error')}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan"
          >
            <option value="all">All Requests</option>
            <option value="success">Success Only</option>
            <option value="error">Errors & Warnings</option>
          </select>
          <button className="text-sm text-brand-cyan hover:text-brand-cyan/80 font-medium">
            View All Logs
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          <p>Failed to load logs. Please try again.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div key={log.id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-4 text-left"
              >
                <span className="text-xs text-text-muted font-mono w-36 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getCarrierColor(log.carrierType)}`}>
                  {log.carrierType}
                </span>
                <span className="text-xs font-mono text-text-secondary flex-1 truncate">
                  <span className="text-text-muted">{log.httpMethod}</span> {log.endpoint}
                </span>
                <span className="text-xs text-text-muted w-16 text-right">
                  {log.durationMs}ms
                </span>
                {getStatusBadge(log)}
                <svg
                  className={`w-4 h-4 text-text-muted transition-transform ${expandedLog === log.id ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {expandedLog === log.id && <LogDetail logId={log.id} />}
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredLogs.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          No logs match the current filter
        </div>
      )}
    </Card>
  );
}
