import React, { useState, useMemo } from 'react';
import Spinner from './Spinner';
import ClipboardIcon from './icons/ClipboardIcon';
import ShieldExclamationIcon from './icons/ShieldExclamationIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import InfoCircleIcon from './icons/InfoCircleIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import Layer3Icon from './icons/Layer3Icon';
import Layer4Icon from './icons/Layer4Icon';
import Layer7Icon from './icons/Layer7Icon';


interface ReportDisplayProps {
  isLoading: boolean;
  error: string | null;
  report: string | null;
}

const RiskBadge: React.FC<{ riskLevel: string }> = ({ riskLevel }) => {
  const level = riskLevel.toLowerCase();

  const riskInfo = useMemo(() => {
    if (level.includes('high')) {
      return { text: 'High Risk', color: 'red', icon: <ShieldExclamationIcon className="w-5 h-5" /> };
    }
    if (level.includes('moderate')) {
      return { text: 'Moderate Risk', color: 'amber', icon: <ShieldCheckIcon className="w-5 h-5" /> };
    }
    return { text: 'Low Risk', color: 'sky', icon: <InfoCircleIcon className="w-5 h-5" /> };
  }, [level]);

  const colors = {
    base: `bg-${riskInfo.color}-500/10 text-${riskInfo.color}-400 ring-${riskInfo.color}-500/30`,
  };

  return (
    <div className={`inline-flex items-center gap-x-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${colors.base}`}>
      {riskInfo.icon}
      {riskInfo.text}
    </div>
  );
};

const ExecutiveSummaryCard: React.FC<{ content: string }> = ({ content }) => {
  const riskMatch = content.match(/Risk Level: (High|Moderate|Low)/i);
  const riskLevel = riskMatch ? riskMatch[1] : 'unknown';
  const summaryText = content.replace(/Risk Level: (High|Moderate|Low)\s*/i, '').trim();

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-100">Executive Summary</h2>
        <RiskBadge riskLevel={riskLevel} />
      </div>
      <p className="text-slate-300 leading-relaxed">{summaryText}</p>
    </div>
  );
};

const AccordionItem: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-700">
      <button
        className="w-full flex justify-between items-center text-left p-4 hover:bg-slate-700/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3 font-semibold text-lg text-slate-200">
          {icon}
          {title}
        </span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-full' : 'max-h-0'}`}>
        <div className="p-4 pl-12 text-slate-300 prose prose-invert max-w-none prose-p:my-1 prose-ul:list-disc prose-ul:my-2">
          {children}
        </div>
      </div>
    </div>
  );
};

const layerIcons: { [key: string]: React.ReactNode } = {
  'layer 7': <Layer7Icon className="text-teal-400" />,
  'layer 4': <Layer4Icon className="text-sky-400" />,
  'layer 3': <Layer3Icon className="text-indigo-400" />,
};

const RemediationTable: React.FC<{ content: string }> = ({ content }) => {
    const rows = content.trim().split('\n').slice(2); // remove header and separator
    const headers = content.trim().split('\n')[0].split('|').slice(1,-1).map(h => h.trim());

    return (
        <div className="overflow-x-auto">
            <table className="w-full my-4 border-collapse text-sm text-left text-slate-300">
                <thead className="bg-slate-700">
                    <tr>
                        {headers.map(header => <th key={header} className="border-b border-slate-600 p-3 font-semibold">{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="bg-slate-800 even:bg-slate-800/50 hover:bg-slate-700/50">
                            {row.split('|').slice(1,-1).map((cell, cellIndex) => {
                                const isCode = cell.trim().startsWith('`') && cell.trim().endsWith('`');
                                const cellContent = isCode ? cell.trim().slice(1, -1) : cell.trim();
                                const isFixColumn = headers[cellIndex]?.toLowerCase().includes('fix');
                                
                                return (
                                    <td key={cellIndex} className="border-b border-slate-700 p-3 align-top">
                                        {isFixColumn && isCode ? (
                                            <div className="relative bg-slate-900 p-2 rounded-md font-mono text-cyan-400 text-xs group">
                                                <code>{cellContent}</code>
                                                <button 
                                                    onClick={() => navigator.clipboard.writeText(cellContent)}
                                                    className="absolute top-1 right-1 p-1 bg-slate-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="Copy command"
                                                >
                                                    <ClipboardIcon copied={false} />
                                                </button>
                                            </div>
                                        ) : (
                                            cellContent
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ReportDisplay: React.FC<ReportDisplayProps> = ({ isLoading, error, report }) => {
  const sections = useMemo(() => {
    if (!report) return null;
    const summary = report.match(/## Executive Summary\s*([\s\S]*?)(?=## |$)/);
    const findings = report.match(/## Findings by OSI Layer\s*([\s\S]*?)(?=## |$)/);
    const remediation = report.match(/## Detailed Remediation Plan\s*([\s\S]*?)(?=## |$)/);
    
    const layerFindings = findings ? findings[1].split(/(?=### Layer)/).filter(p => p.trim()) : [];

    return {
      summary: summary ? summary[1].trim() : '',
      layers: layerFindings.map(layer => {
        const [title, ...content] = layer.trim().split('\n');
        return { title: title.replace(/###\s*/, ''), content: content.join('\n') };
      }),
      remediation: remediation ? remediation[1].trim() : '',
    };
  }, [report]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <Spinner />
          <p className="text-slate-400 text-lg">Generating your comprehensive report...</p>
          <p className="text-slate-500 mt-2">This may take a moment.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      );
    }
    if (report && sections) {
      return (
        <div className="w-full space-y-8">
            {sections.summary && <ExecutiveSummaryCard content={sections.summary} />}
            
            {sections.layers.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 mb-4">Findings by OSI Layer</h2>
                    <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                        {sections.layers.map(({ title, content }) => (
                            <AccordionItem 
                                key={title} 
                                title={title}
                                icon={Object.entries(layerIcons).find(([key]) => title.toLowerCase().includes(key))?.[1] || <div />}
                            >
                                <div dangerouslySetInnerHTML={{__html: content.replace(/\n/g, '<br />') }}/>
                            </AccordionItem>
                        ))}
                    </div>
                </div>
            )}

            {sections.remediation && (
                 <div>
                    <h2 className="text-2xl font-bold text-slate-100 mb-4">Detailed Remediation Plan</h2>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <RemediationTable content={sections.remediation} />
                    </div>
                </div>
            )}
        </div>
      );
    }
    return (
      <div className="text-center text-slate-500 py-10">
        <p>Your compliance report will be displayed here.</p>
        <p>Please provide the required inputs above to begin.</p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8 border border-slate-700 min-h-[200px] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default ReportDisplay;