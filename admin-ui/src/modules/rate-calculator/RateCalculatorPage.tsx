import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface RateQuote {
  carrier: string;
  service: string;
  transitDays: number;
  baseRate: number;
  fuelSurcharge: number;
  discount: number;
  totalRate: number;
}

export function RateCalculatorPage() {
  const [originZip, setOriginZip] = useState('90210');
  const [destinationZip, setDestinationZip] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
  const [quotes, setQuotes] = useState<RateQuote[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    if (!destinationZip || !weight) return;

    setIsCalculating(true);

    // Simulate API call
    setTimeout(() => {
      setQuotes([
        {
          carrier: 'FedEx',
          service: 'Ground',
          transitDays: 5,
          baseRate: 12.50,
          fuelSurcharge: 1.81,
          discount: 2.50,
          totalRate: 11.81,
        },
        {
          carrier: 'FedEx',
          service: 'Express Saver',
          transitDays: 3,
          baseRate: 24.00,
          fuelSurcharge: 3.84,
          discount: 4.80,
          totalRate: 23.04,
        },
        {
          carrier: 'FedEx',
          service: 'Priority Overnight',
          transitDays: 1,
          baseRate: 45.00,
          fuelSurcharge: 7.20,
          discount: 9.00,
          totalRate: 43.20,
        },
        {
          carrier: 'UPS',
          service: 'Ground',
          transitDays: 5,
          baseRate: 13.25,
          fuelSurcharge: 1.89,
          discount: 2.65,
          totalRate: 12.49,
        },
        {
          carrier: 'UPS',
          service: '3 Day Select',
          transitDays: 3,
          baseRate: 22.50,
          fuelSurcharge: 3.15,
          discount: 4.50,
          totalRate: 21.15,
        },
      ]);
      setIsCalculating(false);
    }, 1000);
  };

  const cheapestQuote = quotes.length > 0 ? quotes.reduce((min, q) => q.totalRate < min.totalRate ? q : min) : null;
  const fastestQuote = quotes.length > 0 ? quotes.reduce((min, q) => q.transitDays < min.transitDays ? q : min) : null;

  return (
    <div className="min-h-screen bg-surface-light">
      <div className="px-6 pt-6 pb-3">
        <PageHeader
          title="Rate Calculator"
          subtitle="Compare shipping rates across all carriers"
        />
      </div>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Shipment Details</h3>

            <div className="space-y-4">
              {/* Origin/Destination */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Origin ZIP</label>
                  <input
                    type="text"
                    value={originZip}
                    onChange={(e) => setOriginZip(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                    placeholder="90210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Destination ZIP</label>
                  <input
                    type="text"
                    value={destinationZip}
                    onChange={(e) => setDestinationZip(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                    placeholder="10001"
                  />
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                  placeholder="5"
                />
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Dimensions (inches)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={dimensions.length}
                    onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                    placeholder="L"
                  />
                  <input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                    placeholder="W"
                  />
                  <input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-cyan"
                    placeholder="H"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleCalculate}
                disabled={!destinationZip || !weight || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Get Rates
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2">
            {quotes.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-1">No rates yet</h3>
                  <p className="text-text-secondary">Enter shipment details and click "Get Rates" to compare prices</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Best Options */}
                <div className="grid grid-cols-2 gap-4">
                  {cheapestQuote && (
                    <Card className="border-green-200 bg-green-50/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-100 text-green-700">Cheapest</Badge>
                      </div>
                      <div className="text-2xl font-bold text-text-primary">${cheapestQuote.totalRate.toFixed(2)}</div>
                      <div className="text-sm text-text-secondary">{cheapestQuote.carrier} {cheapestQuote.service}</div>
                      <div className="text-xs text-text-muted">{cheapestQuote.transitDays} day{cheapestQuote.transitDays !== 1 ? 's' : ''}</div>
                    </Card>
                  )}
                  {fastestQuote && (
                    <Card className="border-blue-200 bg-blue-50/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-700">Fastest</Badge>
                      </div>
                      <div className="text-2xl font-bold text-text-primary">${fastestQuote.totalRate.toFixed(2)}</div>
                      <div className="text-sm text-text-secondary">{fastestQuote.carrier} {fastestQuote.service}</div>
                      <div className="text-xs text-text-muted">{fastestQuote.transitDays} day{fastestQuote.transitDays !== 1 ? 's' : ''}</div>
                    </Card>
                  )}
                </div>

                {/* All Quotes */}
                <Card>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">All Rates</h3>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-border">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Carrier</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Service</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Transit</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase">Base</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase">Fuel</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase">Discount</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-white">
                        {quotes.map((quote, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-text-primary">{quote.carrier}</td>
                            <td className="px-4 py-3 text-text-secondary">{quote.service}</td>
                            <td className="px-4 py-3 text-text-secondary">{quote.transitDays} day{quote.transitDays !== 1 ? 's' : ''}</td>
                            <td className="px-4 py-3 text-right font-mono text-sm">${quote.baseRate.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-mono text-sm text-text-muted">+${quote.fuelSurcharge.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-mono text-sm text-green-600">-${quote.discount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-mono text-sm font-semibold">${quote.totalRate.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RateCalculatorPage;
