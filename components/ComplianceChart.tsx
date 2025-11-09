import React, { useMemo } from 'react';
import DocumentSearchIcon from './icons/DocumentSearchIcon';
import Layer3Icon from './icons/Layer3Icon';
import Layer4Icon from './icons/Layer4Icon';
import Layer7Icon from './icons/Layer7Icon';

// FIX: Updated props to accept parsed remediation items directly.
interface RemediationItem {
  osiLayer: string;
}

interface ComplianceChartProps {
  remediationItems: RemediationItem[];
}

// FIX: New counting logic based on the array of parsed items.
const countViolationsByLayer = (items: RemediationItem[]): { layer3: number; layer4: number; layer7: number } => {
  const counts = { layer3: 0, layer4: 0, layer7: 0 };
  if (!items) {
    return counts;
  }
  for (const item of items) {
    if (item.osiLayer?.includes('7')) counts.layer7++;
    else if (item.osiLayer?.includes('4')) counts.layer4++;
    else if (item.osiLayer?.includes('3')) counts.layer3++;
  }
  return counts;
};

const ComplianceChart: React.FC<ComplianceChartProps> = ({ remediationItems }) => {
  // FIX: useMemo now depends on remediationItems.
  const counts = useMemo(() => countViolationsByLayer(remediationItems), [remediationItems]);
  const totalViolations = counts.layer3 + counts.layer4 + counts.layer7;

  // FIX: Check for remediationItems existence.
  if (!remediationItems || totalViolations === 0) {
    return null; // Don't render if no report or no violations
  }

  const getPercentage = (count: number) => totalViolations > 0 ? (count / totalViolations) * 100 : 0;

  const chartData = [
    { name: 'Layer 7', count: counts.layer7, percentage: getPercentage(counts.layer7), color: 'bg-red-500', Icon: Layer7Icon },
    { name: 'Layer 4', count: counts.layer4, percentage: getPercentage(counts.layer4), color: 'bg-yellow-500', Icon: Layer4Icon },
    { name: 'Layer 3', count: counts.layer3, percentage: getPercentage(counts.layer3), color: 'bg-blue-500', Icon: Layer3Icon },
  ];

  return (
    <section className="p-6 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center mb-4">
        <DocumentSearchIcon className="h-7 w-7 mr-3 text-teal-400" />
        <h2 className="text-2xl font-bold text-slate-100">Violations by OSI Layer</h2>
      </div>
      <div className="space-y-4">
        <div className="w-full bg-slate-700 rounded-full h-8 flex overflow-hidden">
          {chartData.map(data => (
            data.percentage > 0 && (
              <div
                key={data.name}
                className={`${data.color} h-8 transition-all duration-500`}
                style={{ width: `${data.percentage}%` }}
                title={`${data.name}: ${data.count} violation(s)`}
              />
            )
          ))}
        </div>
        <div className="flex justify-between items-center text-sm text-slate-400">
          {chartData.map(data => (
            <div key={data.name} className="flex items-center">
              <data.Icon className="h-5 w-5 mr-2" />
              <span>{data.name}: <strong>{data.count}</strong> ({Math.round(data.percentage)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComplianceChart;
