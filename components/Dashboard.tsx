import React, { useState } from 'react';
import { AnalysisResult, FileData } from '../types';
import { ShieldIcon, AlertIcon, CheckIcon } from './Icons';
import { generateNegotiation } from '../services/geminiService';

interface DashboardProps {
  result: AnalysisResult;
  fileData: FileData;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ result, fileData, onReset }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationText, setNegotiationText] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleFixIssues = async () => {
    setIsNegotiating(true);
    try {
      const text = await generateNegotiation(result.summary, result.redFlags);
      setNegotiationText(text);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert("Failed to generate negotiation text. Please try again.");
    } finally {
      setIsNegotiating(false);
    }
  };

  const copyToClipboard = () => {
    if (negotiationText) {
      navigator.clipboard.writeText(negotiationText);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10 relative">
      
      {/* Header with thumbnail and controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img 
            src={fileData.previewUrl} 
            alt="Document Thumbnail" 
            className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" 
          />
          <div>
            <h2 className="text-xl font-bold text-slate-800">Analysis Complete</h2>
            <p className="text-sm text-slate-500">{fileData.file.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Toggle Switch */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${showReasoning ? 'bg-indigo-600' : 'bg-slate-200'}`}
              role="switch"
              aria-checked={showReasoning}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${showReasoning ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm font-medium text-slate-700">Show Reasoning</span>
          </div>

          <button 
            onClick={onReset}
            className="text-sm font-medium text-slate-600 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Upload Another
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: ELI5 Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <ShieldIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">The Simple Truth</h3>
          </div>
          <div className="flex-grow">
            <p className="text-slate-600 leading-relaxed text-lg">
              "{result.summary}"
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
             <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Summary</span>
          </div>
        </div>

        {/* Card 2: Red Flags */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <AlertIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Red Flag Scanner</h3>
          </div>
          <div className="flex-grow space-y-3">
            {result.redFlags.length === 0 ? (
               <p className="text-slate-500 italic">No major red flags detected. Looks clean!</p>
            ) : (
              result.redFlags.map((flag, index) => {
                const isHighRisk = flag.severity === 'high';
                return (
                  <div 
                    key={index} 
                    className={`
                      flex items-start space-x-3 p-4 rounded-xl transition-all
                      ${isHighRisk 
                        ? 'bg-red-50 border border-red-100 shadow-sm' 
                        : 'bg-slate-50 border border-transparent hover:bg-slate-100'}
                    `}
                  >
                    {isHighRisk ? (
                      <div className="bg-red-100 p-1.5 rounded-full text-red-600 mt-0.5 flex-shrink-0">
                         <AlertIcon className="w-5 h-5" />
                      </div>
                    ) : flag.severity === 'medium' ? (
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                    )}
                    
                    <div>
                      <p className={`text-sm font-medium ${isHighRisk ? 'text-red-900' : 'text-slate-800'}`}>
                        {flag.risk}
                      </p>
                      <span className={`text-xs uppercase font-bold tracking-wide ${
                        flag.severity === 'high' ? 'text-red-600' : 
                        flag.severity === 'medium' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {flag.severity} Risk
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Fix It Button */}
          {result.redFlags.length > 0 && (
             <div className="mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={handleFixIssues}
                  disabled={isNegotiating}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isNegotiating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Drafting...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                      </svg>
                      <span>Fix These Issues</span>
                    </>
                  )}
                </button>
             </div>
          )}
        </div>

        {/* Card 3: Action Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <CheckIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Action Items</h3>
          </div>
          <div className="flex-grow">
            <ul className="space-y-3">
              {result.actionItems.length === 0 ? (
                <p className="text-slate-500 italic">No specific actions required.</p>
              ) : (
                result.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                       <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-0 hover:opacity-100 cursor-pointer transition-opacity" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
             <div className="w-full bg-slate-100 rounded-full h-1.5">
               <div className="bg-emerald-500 h-1.5 rounded-full w-1/3"></div>
             </div>
             <p className="text-xs text-slate-400 mt-2 text-right">Progress Tracker</p>
          </div>
        </div>
      </div>

      {/* Reasoning Box - Conditionally Rendered */}
      {showReasoning && (
        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="flex items-center space-x-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Gemini Chain-of-Thought
              </h4>
            </div>
            
            <p className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {result.reasoning || "Reasoning data not available for this scan."}
            </p>
            
            <div className="mt-4 text-[10px] text-slate-600 font-mono">
              SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} // LATENCY: 240ms // MODEL: GEMINI-2.5-FLASH
            </div>
          </div>
        </div>
      )}

      {/* Negotiation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Counter-Offer Draft</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-sm text-slate-700 whitespace-pre-wrap">
                 {negotiationText}
               </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex justify-end space-x-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
              >
                Close
              </button>
              <button 
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5" />
                </svg>
                <span>Copy to Clipboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
