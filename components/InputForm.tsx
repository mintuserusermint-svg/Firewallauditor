
import React from 'react';
import { FIREWALL_VENDORS, COMPLIANCE_STANDARDS } from '../constants';
import UploadIcon from './icons/UploadIcon';

interface InputFormProps {
  vendor: string;
  setVendor: (vendor: string) => void;
  complianceStandard: string;
  setComplianceStandard: (standard: string) => void;
  fileName: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isFormValid: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  vendor,
  setVendor,
  complianceStandard,
  setComplianceStandard,
  fileName,
  onFileChange,
  onSubmit,
  isLoading,
  isFormValid,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8 space-y-6 border border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* File Upload */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="file-upload" className="font-semibold text-slate-300">1. Upload Config</label>
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
          >
            <UploadIcon className="mr-2" />
            <span>{fileName ? 'File Selected' : 'Choose a file...'}</span>
          </label>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileChange} />
          {fileName && <p className="text-sm text-slate-400 truncate text-center" title={fileName}>{fileName}</p>}
        </div>

        {/* Vendor Select */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="vendor" className="font-semibold text-slate-300">2. Select Vendor</label>
          <select
            id="vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          >
            <option value="" disabled>Select a vendor</option>
            {FIREWALL_VENDORS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Compliance Standard Select */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="standard" className="font-semibold text-slate-300">3. Select Standard</label>
          <select
            id="standard"
            value={complianceStandard}
            onChange={(e) => setComplianceStandard(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          >
            <option value="" disabled>Select a standard</option>
            {COMPLIANCE_STANDARDS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      
      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={!isFormValid || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold py-4 px-4 rounded-lg hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          'Generate Compliance Report'
        )}
      </button>
    </div>
  );
};

export default InputForm;
