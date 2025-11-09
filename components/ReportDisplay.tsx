import React, { useState } from 'react';
import Spinner from './Spinner';
import ClipboardIcon from './icons/ClipboardIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import InfoCircleIcon from './icons/InfoCircleIcon';
import ComplianceChart from './ComplianceChart';
import ShieldExclamationIcon from './icons/ShieldExclamationIcon';


interface ReportDisplayProps {
  isLoading: boolean;
  error: string | null;
  report: string | null;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/70 rounded-md p-4 relative font-mono text-sm text-slate-300 overflow-x-auto">
      <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">
        <ClipboardIcon copied={copied} />
      </button>
      <pre><code>{code}</code></pre>
    </div>
  );
};

// FIX: Added robust parsing logic to correctly interpret the structured markdown report from the AI.
// --- Robust Parsing Logic ---

interface RemediationItem {
  violationId: string;
  issue: string;
  ruleAffected: string;
  standard: string;
  osiLayer: string;
  fix: string;
}

const parseSection = (report: string, title: string): string => {
  const regex = new RegExp(`### ${title}(.*?)(### |$)`, 'is');
  const match = report.match(regex);
  return match ? match[1].trim() : '';
};

const parseExecutiveSummary = (report: string): { content: string; riskLevel: string } => {
  const summarySection = parseSection(report, 'A. Executive Summary');
  const riskMatch = summarySection.match(/Risk Level:\s*(High|Moderate|Low)/i);
  const riskLevel = riskMatch ? riskMatch[1] : 'Moderate';
  const content = summarySection.replace(/Risk Level:\s*(High|Moderate|Low)/i, '').trim();
  return { content, riskLevel };
};

const parseRemediationPlan = (report: string): RemediationItem[] => {
  const planSection = parseSection(report, 'C. Detailed Remediation Plan');
  if (!planSection) return [];

  const items: RemediationItem[] = [];
  const itemBlocks = planSection.split(/(?=Violation ID: R-\d+)/).filter(block => block.trim() !== '');

  for (const block of itemBlocks) {
    const lines = block.trim().split('\n');
    const item: Partial<RemediationItem> = {};
    let isReadingFix = false;
    const fixLines: string[] = [];

    for (const line of lines) {
      if (isReadingFix) {
        if (line.trim() === '```') {
          isReadingFix = false;
        } else {
          fixLines.push(line);
        }
        continue;
      }

      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (!match) continue;

      const [, key, value] = match;
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();

      switch (trimmedKey) {
        case 'Violation ID':
          item.violationId = trimmedValue;
          break;
        case 'The Issue/Violation':
          item.issue = trimmedValue;
          break;
        case 'Rule Affected':
          item.ruleAffected = trimmedValue;
          break;
        case 'Compliance Standard':
          item.standard = trimmedValue;
          break;
        case 'OSI Layer':
          item.osiLayer = trimmedValue;
          break;
        case 'Recommended Fix':
          isReadingFix = true;
          if (trimmedValue.startsWith('```')) {
            fixLines.push(trimmedValue.substring(3));
          }
          break;
      }
    }
    item.fix = fixLines.join('\n').replace(/^[a-z-]+\n/, '').trim(); // Remove language hint like `cisco-cli`

    if (item.violationId && item.issue && item.ruleAffected && item.standard && item.osiLayer && item.fix) {
      items.push(item as RemediationItem);
    }
  }
  return items;
};

// --- Helper Components ---

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
          return <p key={index} className="pl-4 relative before:content-['•'] before:absolute before:left-0">{line.trim().substring(1).trim()}</p>;
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
};

const ReportDisplay: React.FC<ReportDisplayProps> = ({ isLoading, error, report }) => {
  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="mt-8 p-6 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
        <h2 className="font-bold text-lg mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!report) {
    return null;
  }
  
  // FIX: Replaced basic string splitting with robust parsing functions.
  // --- Data Extraction using Robust Parsers ---
  const { content: executiveSummary, riskLevel } = parseExecutiveSummary(report);
  const findings = parseSection(report, 'B. Findings by OSI Layer');
  const remediationItems = parseRemediationPlan(report);

  // FIX: Implemented dynamic UI based on parsed risk level.
  const riskConfig = {
    High: { icon: ShieldExclamationIcon, color: 'text-red-400', badge: 'bg-red-900/80 text-red-300' },
    Moderate: { icon: ShieldCheckIcon, color: 'text-yellow-400', badge: 'bg-yellow-900/80 text-yellow-300' },
    Low: { icon: ShieldCheckIcon, color: 'text-green-400', badge: 'bg-green-900/80 text-green-300' },
  }[riskLevel] || { icon: ShieldCheckIcon, color: 'text-yellow-400', badge: 'bg-yellow-900/80 text-yellow-300' };

  const RiskIcon = riskConfig.icon;

  return (
    <div className="mt-8 space-y-8">
      {/* Executive Summary */}
      <section className="p-6 bg-slate-800 rounded-lg border border-slate-700 relative">
        <div className="flex items-start mb-3">
          <RiskIcon className={`h-7 w-7 mr-3 shrink-0 ${riskConfig.color}`} />
          <h2 className="text-2xl font-bold text-slate-100">Executive Summary</h2>
        </div>
        <span className={`absolute top-4 right-4 px-3 py-1 text-sm font-semibold rounded-full ${riskConfig.badge}`}>{riskLevel} Risk</span>
        <div className="text-slate-300 pl-10">
          <SimpleMarkdown text={executiveSummary || 'No summary available.'} />
        </div>
      </section>
      
      {/* Compliance Chart */}
      <ComplianceChart remediationItems={remediationItems} />

      {/* Findings */}
      <section className="p-6 bg-slate-800 rounded-lg border border-slate-700">
         <div className="flex items-center mb-3">
           <InfoCircleIcon className="h-7 w-7 mr-3 text-blue-400" />
           <h2 className="text-2xl font-bold text-slate-100">Findings Details</h2>
         </div>
         <div className="text-slate-300 prose prose-invert max-w-none">
           {findings?.split(/####\s*/).filter(s => s.trim() !== '').map((section, index) => {
             const [title, ...contentArr] = section.trim().split('\n');
             const content = contentArr.join('\n');
             return (
               <div key={index} className="mt-4">
                 <h4 className="font-bold text-lg text-slate-200">{title}</h4>
                 <div className="text-slate-400"><SimpleMarkdown text={content} /></div>
               </div>
             );
           }) || <p>No findings detailed.</p>}
         </div>
       </section>

      {/* Remediation Plan Table */}
      <section>
         <div className="flex items-center mb-3 p-2">
             <h2 className="text-2xl font-bold text-slate-100">Detailed Remediation Plan</h2>
         </div>
        <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-lg">
           {remediationItems && remediationItems.length > 0 ? (
            // FIX: Replaced divs with a semantic and accessible table for remediation items.
            <table className="min-w-full text-sm text-left text-slate-300 table-fixed">
                <thead className="bg-slate-900/70 text-xs uppercase text-slate-400">
                    <tr>
                        <th scope="col" className="px-6 py-3 w-1/6">Violation ID</th>
                        <th scope="col" className="px-6 py-3 w-2/6">Issue / Violation</th>
                        <th scope="col" className="px-6 py-3 w-1/6">OSI Layer</th>
                        <th scope="col" className="px-6 py-3 w-2/6">Recommended Fix</th>
                    </tr>
                </thead>
                <tbody>
                    {remediationItems.map((item, index) => item && (
                      <tr key={index} className="border-b border-slate-700 even:bg-slate-800/40 hover:bg-slate-700/50">
                          <td className="px-6 py-4 font-medium text-blue-400 whitespace-nowrap">{item.violationId}</td>
                          <td className="px-6 py-4">{item.issue}</td>
                          <td className="px-6 py-4">{item.osiLayer}</td>
                          <td className="px-6 py-4"><CodeBlock code={item.fix} /></td>
                      </tr>
                    ))}
                </tbody>
            </table>
           ) : (
             <div className="text-slate-400 p-6 bg-slate-800 rounded-lg border border-slate-700">No remediation items found.</div>
           )}
        </div>
      </section>
    </div>
  );
};

export default ReportDisplay;
