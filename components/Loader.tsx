import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
      <div className="relative w-32 h-40 bg-white border-2 border-slate-200 rounded-lg shadow-lg overflow-hidden">
        {/* Mock Text Lines */}
        <div className="p-4 space-y-2">
          <div className="h-2 bg-slate-200 rounded w-3/4"></div>
          <div className="h-2 bg-slate-200 rounded w-full"></div>
          <div className="h-2 bg-slate-200 rounded w-5/6"></div>
          <div className="h-2 bg-slate-200 rounded w-full"></div>
          <div className="h-2 bg-slate-200 rounded w-2/3"></div>
          <div className="mt-4 h-2 bg-slate-200 rounded w-full"></div>
          <div className="h-2 bg-slate-200 rounded w-4/5"></div>
        </div>

        {/* Scanning Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
      </div>
      <h3 className="mt-8 text-xl font-medium text-slate-700 animate-pulse">Analyzing Document...</h3>
      <p className="mt-2 text-sm text-slate-500">Looking for hidden clauses and fees</p>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 100%; }
          90% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
