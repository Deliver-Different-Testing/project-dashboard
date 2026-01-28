import { useState } from 'react';
import { Card } from '../../../components/layout/Card';
import { Badge } from '../../../components/ui/Badge';

interface IntegrationLog {
  id: string;
  timestamp: string;
  carrier: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'success' | 'error' | 'warning';
  statusCode: number;
  duration: number;
  request?: string;
  response?: string;
}

// Mock data for demonstration
const mockLogs: IntegrationLog[] = [
  {
    id: '1',
    timestamp: '2026-01-29 10:45:32',
    carrier: 'FedEx',
    endpoint: '/rate/v1/rates/quotes',
    method: 'POST',
    status: 'success',
    statusCode: 200,
    duration: 342,
    request: '{"accountNumber":"123456789","requestedShipment":{"shipper":{"address":{"postalCode":"90210"}},"recipient":{"address":{"postalCode":"10001"}}}}',
    response: '{"output":{"rateReplyDetails":[{"serviceType":"FEDEX_GROUND","ratedShipmentDetails":[{"totalNetCharge":{"amount":"24.50"}}]}]}}',
  },
  {
    id: '2',
    timestamp: '2026-01-29 10:44:18',
    carrier: 'UPS',
    endpoint: '/api/rating/v1/Shop',
    method: 'POST',
    status: 'success',
    statusCode: 200,
    duration: 289,
    request: '{"RateRequest":{"Shipment":{"Shipper":{"Address":{"PostalCode":"90210"}}}}}',
    response: '{"RateResponse":{"RatedShipment":[{"TotalCharges":{"MonetaryValue":"22.75"}}]}}',
  },
  {
    id: '3',
    timestamp: '2026-01-29 10:43:05',
    carrier: 'FedEx',
    endpoint: '/track/v1/trackingnumbers',
    method: 'POST',
    status: 'success',
    statusCode: 200,
    duration: 156,
    request: '{"trackingInfo":[{"trackingNumberInfo":{"trackingNumber":"794644790132"}}]}',
    response: '{"output":{"completeTrackResults":[{"trackResults":[{"latestStatusDetail":{"statusByLocale":"Delivered"}}]}]}}',
  },
  {
    id: '4',
    timestamp: '2026-01-29 10:42:51',
    carrier: 'FedEx',
    endpoint: '/oauth/token',
    method: 'POST',
    status: 'error',
    statusCode: 401,
    duration: 89,
    request: '{"grant_type":"client_credentials","client_id":"***","client_secret":"***"}',
    response: '{"errors":[{"code":"UNAUTHORIZED","message":"Invalid credentials"}]}',
  },
  {
    id: '5',
    timestamp: '2026-01-29 10:41:33',
    carrier: 'DHL',
    endpoint: '/express/rates',
    method: 'POST',
    status: 'warning',
    statusCode: 200,
    duration: 2105,
    request: '{"customerDetails":{"shipperDetails":{"postalCode":"90210"}}}',
    response: '{"products":[{"productName":"EXPRESS WORLDWIDE","totalPrice":[{"price":45.00}]}]}',
  },
];

const getStatusBadge = (status: IntegrationLog['status'], statusCode: number) => {
  switch (status) {
    case 'success':
      return <Badge className="bg-green-100 text-green-700">{statusCode} OK</Badge>;
    case 'error':
      return <Badge className="bg-red-100 text-red-700">{statusCode} Error</Badge>;
    case 'warning':
      return <Badge className="bg-amber-100 text-amber-700">{statusCode} Slow</Badge>;
  }
};

const getCarrierColor = (carrier: string) => {
  switch (carrier.toLowerCase()) {
    case 'fedex':
      return 'text-purple-700 bg-purple-100';
    case 'ups':
      return 'text-amber-700 bg-amber-100';
    case 'usps':
      return 'text-blue-700 bg-blue-100';
    case 'dhl':
      return 'text-red-700 bg-red-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

export function TroubleshootingLogs() {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');

  const filteredLogs = mockLogs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'error') return log.status === 'error' || log.status === 'warning';
    return log.status === filter;
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

      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div key={log.id} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-4 text-left"
            >
              <span className="text-xs text-text-muted font-mono w-36 flex-shrink-0">
                {log.timestamp}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${getCarrierColor(log.carrier)}`}>
                {log.carrier}
              </span>
              <span className="text-xs font-mono text-text-secondary flex-1 truncate">
                <span className="text-text-muted">{log.method}</span> {log.endpoint}
              </span>
              <span className="text-xs text-text-muted w-16 text-right">
                {log.duration}ms
              </span>
              {getStatusBadge(log.status, log.statusCode)}
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

            {expandedLog === log.id && (
              <div className="p-4 border-t border-border bg-white space-y-3">
                <div>
                  <div className="text-xs font-medium text-text-secondary mb-1">Request</div>
                  <pre className="text-xs font-mono bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(JSON.parse(log.request || '{}'), null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="text-xs font-medium text-text-secondary mb-1">Response</div>
                  <pre className={`text-xs font-mono p-3 rounded-lg overflow-x-auto ${log.status === 'error' ? 'bg-red-950 text-red-400' : 'bg-gray-900 text-blue-400'}`}>
                    {JSON.stringify(JSON.parse(log.response || '{}'), null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          No logs match the current filter
        </div>
      )}
    </Card>
  );
}
