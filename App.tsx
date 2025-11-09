import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ReportDisplay from './components/ReportDisplay';
import { generateComplianceReport } from './services/geminiService';

const App: React.FC = () => {
  const [firewallConfig, setFirewallConfig] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');
  const [complianceStandard, setComplianceStandard] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFirewallConfig(text);
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleGenerateReport = useCallback(async () => {
    if (!firewallConfig || !vendor || !complianceStandard) {
      setError("Please ensure all fields are filled and a file is uploaded.");
      return;
    }
    
    setIsLoading(true);
    setReport(null);
    setError(null);

    try {
      const generatedReport = await generateComplianceReport({
        config: firewallConfig,
        vendor: vendor,
        standard: complianceStandard,
      });
      setReport(generatedReport);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(`Failed to generate report: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [firewallConfig, vendor, complianceStandard]);

  const isFormValid = useMemo(() => {
    return !!firewallConfig && !!vendor && !!complianceStandard;
  }, [firewallConfig, vendor, complianceStandard]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Header />
        <main>
          <InputForm 
            vendor={vendor}
            setVendor={setVendor}
            complianceStandard={complianceStandard}
            setComplianceStandard={setComplianceStandard}
            fileName={fileName}
            onFileChange={handleFileChange}
            onSubmit={handleGenerateReport}
            isLoading={isLoading}
            isFormValid={isFormValid}
          />
          <ReportDisplay 
            isLoading={isLoading}
            error={error}
            report={report}
          />
        </main>
        <footer className="text-center text-slate-600 p-8 text-sm">
          <p>&copy; {new Date().getFullYear()} Sentinel AI. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;