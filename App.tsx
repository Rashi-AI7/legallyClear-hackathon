import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Loader from './components/Loader';
import { analyzeDocument } from './services/geminiService';
import { AnalysisResult, FileData } from './types';
import { ShieldIcon } from './components/Icons';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelect = async (data: FileData) => {
    setFileData(data);
    setStatus('scanning');
    setErrorMsg('');

    try {
      // Simulate a small delay for better UX if the API is too fast
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2000));
      const apiCall = analyzeDocument(data.base64, data.mimeType);

      const [result] = await Promise.all([apiCall, minLoadingTime]);

      setAnalysisResult(result);
      setStatus('complete');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || "Something went wrong during analysis.");
    }
  };

  const resetApp = () => {
    setFileData(null);
    setAnalysisResult(null);
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={resetApp}>
              <div className="bg-slate-900 p-1.5 rounded-lg text-white">
                 <ShieldIcon className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">LegallyClear</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Beta v1.0</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hero / Header Text */}
        {status === 'idle' && (
           <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Understand what you're signing.
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Upload any contract, policy, or bill. Our AI translates legal jargon into plain English and highlights the risks you need to know about.
            </p>
          </div>
        )}

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto transition-all duration-500 ease-in-out">
          
          {/* Error State */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl mb-6 flex justify-between items-center">
              <span>{errorMsg}</span>
              <button onClick={resetApp} className="text-sm font-bold hover:underline">Try Again</button>
            </div>
          )}

          {/* Idle: Upload Zone */}
          {status === 'idle' && (
            <FileUpload onFileSelect={handleFileSelect} isProcessing={false} />
          )}

          {/* Scanning: Loader */}
          {status === 'scanning' && (
            <Loader />
          )}

          {/* Complete: Dashboard */}
          {status === 'complete' && analysisResult && fileData && (
            <Dashboard 
              result={analysisResult} 
              fileData={fileData} 
              onReset={resetApp} 
            />
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-slate-400 text-sm border-t border-slate-200">
        <p>© 2024 LegallyClear. Powered by Google Gemini 2.5 Flash.</p>
      </footer>
    </div>
  );
};

export default App;
