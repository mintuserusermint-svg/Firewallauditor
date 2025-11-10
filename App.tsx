import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ReportDisplay from './components/ReportDisplay';
// REMOVED: No longer importing the local service for AI processing.
// ADDED: Import new Firebase client service for backend communication.
import { uploadAndStartAnalysis, onReportUpdate } from './firebase/client';

const App: React.FC = () => {
  // UPDATED: State now holds the File object, not its text content.
  const [configFile, setConfigFile] = useState<File | null>(null);
  const [vendor, setVendor] = useState<string>('');
  const [complianceStandard, setComplianceStandard] = useState<string>('');
  
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // UPDATED: This callback now just stores the File object.
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setConfigFile(file);
    }
  }, []);

  // REWRITTEN: This function now orchestrates the backend job.
  const handleGenerateReport = useCallback(async () => {
    // 1. Core analysis logic has been moved to a secure backend Cloud Function.
    // The frontend is now only responsible for uploading the file and
    // triggering the analysis job.
    if (!configFile || !vendor || !complianceStandard) {
      setError("Please ensure all fields are filled and a file is uploaded.");
      return;
    }
    
    setIsLoading(true);
    setReport(null);
    setError(null);
    setReportId(null);

    try {
      // 2. Call the service to upload the file and start the backend analysis.
      // This returns a unique ID for the job.
      const id = await uploadAndStartAnalysis({
        file: configFile,
        vendor: vendor,
        standard: complianceStandard,
      });
      setReportId(id);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(`Failed to start analysis job: ${errorMessage}`);
      setIsLoading(false);
    }
  }, [configFile, vendor, complianceStandard]);

  // ADDED: A new effect to listen for the report result from Firestore.
  useEffect(() => {
    // 3. Once a report ID is available, we establish a real-time listener
    // on our backend (Cloud Firestore) to wait for the result.
    if (!reportId) {
      return;
    }

    const unsubscribe = onReportUpdate(reportId, (data) => {
      // The backend will update the document with status changes.
      // We react to those changes here.
      if (data?.status === 'complete') {
        setReport(data.report);
        setError(null);
        setIsLoading(false);
        unsubscribe(); // Stop listening once the job is complete.
      } else if (data?.status === 'error') {
        setError(`Backend failed to generate report: ${data.errorMessage}`);
        setReport(null);
        setIsLoading(false);
        unsubscribe(); // Stop listening on error.
      }
      // While status is 'processing', isLoading remains true.
    });
    
    // Cleanup function to remove the listener when the component unmounts
    // or if a new report is generated.
    return () => unsubscribe();
  }, [reportId]);

  const isFormValid = useMemo(() => {
    return !!configFile && !!vendor && !!complianceStandard;
  }, [configFile, vendor, complianceStandard]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Header />
        <main>
          <InputForm 
            vendor={vendor}
            setVendor={setVendor}
            complianceStandard={complianceStandard}
            // FIX: Pass the setComplianceStandard state setter to the InputForm component.
            setComplianceStandard={setComplianceStandard}
            // UPDATED: Pass the file name for display, not the full content.
            fileName={configFile?.name || null}
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